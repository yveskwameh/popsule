"use client";

import { useMemo, useRef, type RefObject } from "react";
import {
  Color,
  Euler,
  Matrix4,
  Plane,
  Quaternion,
  Vector3,
  type Group,
  type InstancedMesh,
  type Mesh,
  type MeshBasicMaterial,
  type Object3D,
} from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import { palette, products, toneHex } from "@/lib/brand";
import { capsuleColors, type LabSnapshot } from "@/lib/lab";
import { reducedMotion } from "@/lib/motion";
import { chapters, ease, HANDLE_UNTIL, mix, rangeStep, seg, story } from "@/lib/story";
import { openCurve } from "@/components/product/Handled";
import { CAN, useParts } from "@/components/product/model";
import Jar from "@/components/product/Jar";
import Canister from "@/components/product/Canister";
import SoftShadow from "@/components/canvas/SoftShadow";

// Piecewise keyframes on the story clock: [p, value] pairs, eased between.
type Keys = [number, number][];
function at(p: number, keys: Keys) {
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1] = keys[i];
    if (p <= t1) {
      const [t0, v0] = keys[i - 1];
      return mix(v0, v1, ease(seg(p, t0, t1)));
    }
  }
  return keys[keys.length - 1][1];
}

const TAU = Math.PI * 2;
const R = chapters.range[0];
// The range swaps product at each slice boundary, mid-spin.
const boundaries = [1, 2, 3].map((i) => R + i * rangeStep);

// Camera that keeps a box of the story in frame at any aspect ratio.
function StoryCamera({ wide }: { wide: boolean }) {
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const halfTan = Math.tan((15 * Math.PI) / 180);
  // Narrow screens keep the top ~45% for text, so they fit a taller box.
  const [w, h] = wide ? [7.2, 4.7] : [4.4, 7.2];
  const distance = Math.max(h / 2 / halfTan, w / 2 / (halfTan * aspect));
  return <PerspectiveCamera makeDefault fov={30} position={[0, 1.15, distance]} rotation-x={-0.03} />;
}

// Clips the capsule pile to the jar while it refills. There is one story scene,
// so a module-level plane is fine.
const clip = [new Plane(new Vector3(0, 1, 0), 1000)];

// Where each callout pins to, in the local space of a part.
type AnchorPart = "lid" | "jar" | "label" | "pile";
const anchorPoints: Record<string, [AnchorPart, [number, number, number]]> = {
  lid: ["jar", [0.8, 1.66, 0.12]], // follows the lid's lift, not its spin
  thread: ["jar", [-0.72, 1.52, 0.12]],
  label: ["label", [-0.78, 0.86, 0.1]],
  glass: ["jar", [0.77, 0.32, 0.12]],
  capsules: ["pile", [0.55, 0.5, 0.15]],
};

// Twelve refill canisters ringed around the jar like the hours of a clock.
function YearRing({ ring }: { ring: RefObject<Group | null> }) {
  const parts = useParts();
  const body = useRef<InstancedMesh>(null!);
  const lid = useRef<InstancedMesh>(null!);
  const line = useRef<InstancedMesh>(null!);
  const colored = useRef(false);

  useFrame(() => {
    const p = story.p;
    const [a] = chapters.year;
    const m = new Matrix4();
    const q = new Quaternion();
    const pos = new Vector3();
    const s = new Vector3();
    const radius = (ring.current?.userData.radius as number) ?? 2;
    const spin = at(p, [
      [a, -0.6],
      [chapters.year[1], 0.5],
    ]);
    for (let i = 0; i < 12; i++) {
      // Each month drops in a beat after the last, then all leave together.
      const grow = at(p, [
        [a + 0.004 * i, 0],
        [a + 0.03 + 0.004 * i, 1],
        [chapters.year[1] - 0.02, 1],
        [chapters.year[1] + 0.01, 0],
      ]);
      const ang = spin + (i / 12) * TAU;
      pos.set(Math.sin(ang) * radius, (1 - grow) * 1.2, Math.cos(ang) * radius);
      q.setFromEuler(new Euler(0, ang, 0));
      s.setScalar(0.46 * grow + 1e-4);
      m.compose(pos, q, s);
      body.current.setMatrixAt(i, m);
      lid.current.setMatrixAt(i, m);
      line.current.setMatrixAt(i, m);
    }
    body.current.instanceMatrix.needsUpdate = true;
    lid.current.instanceMatrix.needsUpdate = true;
    line.current.instanceMatrix.needsUpdate = true;

    if (!colored.current) {
      const c = new Color();
      for (let i = 0; i < 12; i++) body.current.setColorAt(i, c.set(toneHex(products[i % 4].tone)));
      body.current.instanceColor!.needsUpdate = true;
      colored.current = true;
    }
  });

  return (
    <group ref={ring}>
      <instancedMesh ref={body} args={[parts.Can_Body, undefined, 12]} frustumCulled={false}>
        <meshPhysicalMaterial metalness={0.6} roughness={0.42} clearcoat={0.2} clearcoatRoughness={0.4} />
      </instancedMesh>
      <instancedMesh ref={lid} args={[parts.Can_Lid, undefined, 12]} frustumCulled={false}>
        <meshPhysicalMaterial color={palette.graphite} metalness={0.4} roughness={0.45} clearcoat={0.2} />
      </instancedMesh>
      <instancedMesh ref={line} args={[parts.Can_Line, undefined, 12]} frustumCulled={false}>
        <meshStandardMaterial color={palette.steel} metalness={1} roughness={0.22} />
      </instancedMesh>
    </group>
  );
}

// Capsules falling from the tipped refill into the jar.
const POUR = 40;
let seed = 21;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
const seeds = Array.from({ length: POUR }, () => ({ dx: rand() - 0.5, dz: rand() - 0.5, spin: 2 + rand() * 6, land: rand() }));

function PourStream({
  colors,
  from,
  to,
}: {
  colors: string[];
  from: RefObject<Object3D | null>;
  to: RefObject<Object3D | null>;
}) {
  const parts = useParts();
  const mesh = useRef<InstancedMesh>(null!);
  const tint = useRef("");

  useFrame(() => {
    const t = seg(story.p, 0.51, 0.55);
    const start = new Vector3();
    const end = new Vector3();
    from.current?.getWorldPosition(start);
    to.current?.getWorldPosition(end);
    mesh.current.parent!.worldToLocal(start);
    mesh.current.parent!.worldToLocal(end);
    const m = new Matrix4();
    const q = new Quaternion();
    const pos = new Vector3();
    const one = new Vector3(1, 1, 1);
    const zero = new Vector3(0, 0, 0);
    for (let i = 0; i < POUR; i++) {
      const s = seeds[i];
      const k = seg(t, (i / POUR) * 0.7, (i / POUR) * 0.7 + 0.3);
      const live = k > 0 && k < 1;
      // Falls with gravity: slow out of the can, fast into the jar.
      pos.set(
        mix(start.x, end.x + s.dx * 0.6, k),
        mix(start.y, end.y + 0.2 + s.land * 0.25, k * k),
        mix(start.z, end.z + s.dz * 0.6, k),
      );
      q.setFromEuler(new Euler(k * s.spin, k * s.spin * 0.7, 0.4));
      mesh.current.setMatrixAt(i, m.compose(pos, q, live ? one : zero));
    }
    mesh.current.instanceMatrix.needsUpdate = true;

    const key = colors.join();
    if (tint.current !== key) {
      const c = new Color();
      for (let i = 0; i < POUR; i++) mesh.current.setColorAt(i, c.set(colors[i % colors.length]));
      mesh.current.instanceColor!.needsUpdate = true;
      tint.current = key;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[parts.Capsule, undefined, POUR]} frustumCulled={false}>
      <meshPhysicalMaterial roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.2} />
    </instancedMesh>
  );
}

// The four formulas in a queue receding to the back right. Scroll moves the
// queue forward one jar at a time; the jar in front steps aside and fades.
// The front slot lines up with the story jar so the hand-off is invisible.
const LINEUP_IN = chapters.range[0] + 0.022; // once the story jar has settled
function Lineup({ x, step }: { x: number; step: [number, number] }) {
  const table = useRef<Group>(null!);
  const jars = useRef<(Group | null)[]>([]);

  useFrame(({ clock }) => {
    const p = story.p;
    const g = table.current;
    g.visible = p >= LINEUP_IN;
    if (!g.visible) return;
    g.position.set(x, 0, 0);
    let turn = 0;
    for (const b of boundaries) turn += ease(seg(p, b - rangeStep * 0.3, b + rangeStep * 0.3));
    const grow = ease(seg(p, LINEUP_IN, LINEUP_IN + 0.03));
    jars.current.forEach((jar, i) => {
      if (!jar) return;
      const d = i - turn;
      // Waiting jars queue up behind; a jar that has had its turn steps forward-left and shrinks away.
      const queued = Math.max(0, d) * (i === 0 ? 1 : grow);
      const gone = Math.min(0, d);
      jar.position.set(queued * step[0] + gone * 1.6, 0, -queued * step[1] - gone * 0.8);
      jar.scale.setScalar(Math.max(1e-4, 1 + gone * 1.1));
      jar.rotation.y = -0.3 + Math.max(0, d) * 0.25 + (reducedMotion() ? 0 : Math.sin(clock.elapsedTime * 0.4) * 0.04);
    });
  });

  return (
    <group ref={table} visible={false}>
      {products.map((p, i) => (
        <group key={p.id} ref={(el) => void (jars.current[i] = el)}>
          <Jar
            lid={toneHex(p.tone)}
            glass="frosted"
            metal="satin"
            label={{ text: p.name, font: "display" }}
            capsules={capsuleColors([p.id])}
          />
          <SoftShadow position={[0, 0.002, 0]} size={2.4} opacity={0.26} />
        </group>
      ))}
    </group>
  );
}

export default function StoryScene() {
  const parts = useParts();
  const size = useThree((s) => s.size);
  const wide = size.width > size.height * 0.9;
  const product = products[0];

  const world = useRef<Group>(null!);
  const jar = useRef<Group>(null!);
  const lid = useRef<Group>(null);
  const label = useRef<Group>(null);
  const pile = useRef<Group>(null);
  const can = useRef<Group>(null!);
  const tilt = useRef<Group>(null!);
  const canLid = useRef<Group>(null);
  const ring = useRef<Group>(null);
  const mouth = useRef<Group>(null!);
  const fill = useRef<Group>(null!);
  const spareLid = useRef<Group>(null!);
  const jarShadow = useRef<Mesh>(null!);
  const canShadow = useRef<Mesh>(null!);
  const tilted = useRef({ x: 0, y: 0 });
  // Hand-spin momentum and offset for the hero jar, plus the capsule slosh.
  const handSpin = useRef({ v: 0, r: 0 });
  const slosh = useRef({ x: 0, v: 0 });
  const peekS = useRef(0);

  const design: LabSnapshot = useMemo(
    () => ({
      goals: [product.id],
      size: 60,
      lid: product.tone,
      refill: product.tone,
      matchRefill: true,
      glass: "frosted",
      metal: "satin",
      label: { text: product.name, font: "display" },
    }),
    [product],
  );

  useFrame((state, dt) => {
    const p = story.p;
    const { camera } = state;

    // Layout: products sit right of the text on wide screens, centred below it on narrow ones.
    const jx = wide
      ? at(p, [
          [0.02, 1.35],
          [0.14, 0],
          [0.34, 0],
          [0.37, 0.55],
          [0.62, 0.55],
          [0.67, 2],
          [0.77, 2],
          [0.8, 1.6],
        ])
      : 0;
    jar.current.position.x = jx;
    // Drop the floor for the tall moments (the opened jar, the can above it)
    // so nothing slides under the header.
    world.current.position.y = wide
      ? at(p, [[0.1, 0], [0.16, -0.45], [0.31, -0.45], [0.35, -0.5], [0.61, -0.5], [0.65, 0]])
      : at(p, [[0.06, -2.4], [0.16, -1.1], [0.31, -1.1], [0.35, -2], [0.61, -2], [0.65, -1.05], [0.78, -1.05], [0.82, -1.5]]);
    if (ring.current) {
      ring.current.position.x = jx;
      ring.current.userData.radius = wide ? 1.9 : 1.5;
    }

    // A gentle lean towards the cursor, plus a top-down tilt for the year ring.
    const ease8 = 1 - Math.exp(-dt * 4);
    tilted.current.x += (story.mouse.x - tilted.current.x) * ease8;
    tilted.current.y += (story.mouse.y - tilted.current.y) * ease8;
    world.current.rotation.y = tilted.current.x * 0.12;
    // Step back for the tall moments (opened jar, can above it) and the wide
    // year ring, so everything stays clear of the header.
    world.current.scale.setScalar(at(p, [[0.1, 1], [0.16, 0.85], [0.61, 0.85], [0.67, 0.8], [0.76, 0.8], [0.8, 1]]));
    world.current.rotation.x = tilted.current.y * 0.04 + at(p, [[0.62, 0], [0.67, 0.42], [0.76, 0.42], [0.8, 0]]);

    // Jar turn: a slow look-around, then a full spin at each product swap.
    const spin = at(p, [[0, -0.25], [0.1, 0], [0.24, -0.35], [0.34, 0], [0.62, 0], [0.78, -0.3]]);
    // Hero only: spin it by hand; it coasts, then settles back on the label.
    const hs = handSpin.current;
    const h = story.hand;
    hs.v = h.dragging && p < HANDLE_UNTIL ? h.velocity : hs.v * Math.pow(0.04, dt);
    hs.r += hs.v;
    if (!h.dragging && Math.abs(hs.v) < 0.0005) hs.r += (Math.round(hs.r / TAU) * TAU - hs.r) * (1 - Math.exp(-dt * 2.4));
    jar.current.rotation.y = spin + hs.r + (reducedMotion() ? 0 : Math.sin(state.clock.elapsedTime * 0.4) * 0.04);
    jar.current.visible = p < LINEUP_IN;
    jarShadow.current.visible = jar.current.visible;

    // Anatomy: the lid unscrews, then the capsules rise out of the open top
    // and hang between lid and jar. Refill: the lid comes off and is set down
    // on the floor to the right.
    if (lid.current) {
      lid.current.position.set(
        at(p, [[0.37, 0], [0.405, 2], [0.605, 2], [0.618, 0]]),
        at(p, [
          [0.12, 0],
          [0.19, 1.6],
          [0.3, 1.6],
          [0.335, 0],
          [0.36, 0],
          [0.375, 0.8],
          [0.405, 0.6],
          [0.42, -1.43],
          [0.6, -1.43],
          [0.61, 0.8],
          [0.618, 0.8],
          [0.622, 0],
        ]),
        0,
      );
      lid.current.rotation.y = at(p, [[0.12, 0], [0.19, -2.4], [0.3, -2.4], [0.335, 0], [0.36, 0], [0.39, -2], [0.61, -2], [0.622, 0]]);
    }
    if (label.current) {
      const s = at(p, [[0.15, 1], [0.22, 1.32], [0.3, 1.32], [0.335, 1]]);
      label.current.scale.set(s, 1, s);
    }
    if (pile.current) {
      pile.current.position.y = at(p, [
        [0.16, 0],
        [0.24, 1.72],
        [0.3, 1.72],
        [0.335, 0],
        [0.36, 0],
        [0.4, -0.62],
        [0.51, -0.62],
        [0.55, 0],
      ]);
    }
    // Hero only: peek under the lid on hover, click to open, capsules slosh.
    // The jar drops by half the lid's lift so the opened jar stays centred.
    const live = p < HANDLE_UNTIL;
    // Is the pointer over the jar? Its outline on screen, from base to lid.
    let topHalf = false;
    if (live) {
      const lo = new Vector3(-0.85, 0, 0);
      const hi = new Vector3(0.85, 1.85, 0);
      jar.current.localToWorld(lo).project(camera);
      jar.current.localToWorld(hi).project(camera);
      const mx = story.mouse.x;
      const my = -story.mouse.y;
      topHalf = my > (lo.y + hi.y) / 2;
      story.overJar = mx > Math.min(lo.x, hi.x) && mx < Math.max(lo.x, hi.x) && my > Math.min(lo.y, hi.y) && my < Math.max(lo.y, hi.y);
    } else story.overJar = false;
    const { up, hop } = live ? openCurve(h.openedAt) : { up: 0, hop: 0 };
    peekS.current += ((live && story.overJar && topHalf ? 0.12 : 0) - peekS.current) * (1 - Math.exp(-dt * 6));
    const peek = peekS.current;
    const extra = Math.max(peek, up * 0.6);
    const sl = slosh.current;
    sl.v += ((live && story.overJar ? story.mouse.x : 0) - sl.x) * 0.12 - sl.v * 0.14;
    sl.x += sl.v;
    if (lid.current) {
      lid.current.position.y += extra;
      lid.current.rotation.y += -up * 2.2;
    }
    if (pile.current) {
      pile.current.position.y += hop * 0.54;
      // Swirl about the jar's axis rather than shifting, so nothing pokes through the glass.
      pile.current.position.x = Math.max(-0.03, Math.min(0.03, sl.x * 0.03));
      pile.current.rotation.y = sl.x * 0.9;
    }
    // Shift the whole shot (floor, shadow, refill) so it reads like the camera re-framing.
    world.current.position.y -= extra / 2;


    // Only clip the pile to the jar while it is being refilled.
    const refilling = p > 0.345 && p < 0.62;
    const base = new Vector3();
    jar.current.getWorldPosition(base);
    clip[0].constant = refilling ? -(base.y + 0.06) : 1000;

    // The refill hovers upright over the open jar, its lid is lifted off and
    // stacked on the jar lid, then it tips from the rim (pivot = rim centre).
    // Every pose keeps the can clear of the glass.
    const off = 6;
    const hover = 3.0;
    const pourX = jx + 0.45;
    const pourY = 2.25;
    can.current.position.set(
      wide
        ? at(p, [[0.02, 2.9], [0.12, off], [0.4, off], [0.44, jx], [0.48, jx], [0.51, pourX], [0.55, pourX], [0.57, jx], [0.59, jx], [0.61, off]])
        : at(p, [[0.02, 1.0], [0.12, off], [0.4, off], [0.44, jx], [0.48, jx], [0.51, pourX], [0.55, pourX], [0.57, jx], [0.59, jx], [0.61, off]]),
      at(p, [[0.4, CAN.lidBase], [0.44, hover], [0.48, hover], [0.51, pourY], [0.55, pourY], [0.57, hover], [0.59, hover], [0.61, hover + 1.5], [0.615, CAN.lidBase]]),
      wide ? at(p, [[0.02, -0.6], [0.12, 0]]) : at(p, [[0.02, -1.5], [0.12, 0]]),
    );
    tilt.current.rotation.z = at(p, [[0.48, 0], [0.51, 2.35], [0.55, 2.35], [0.57, 0]]);
    can.current.rotation.y = at(p, [[0, -0.35], [0.12, 0]]);

    // While it is off the can, a stand-in lid travels in world space.
    const lidOff = p > 0.445 && p < 0.588;
    if (canLid.current) canLid.current.visible = !lidOff;
    spareLid.current.visible = lidOff;
    spareLid.current.position.set(
      at(p, [[0.455, jx], [0.465, jx + 1.3], [0.475, jx + 2], [0.57, jx + 2], [0.58, jx + 1.3], [0.584, jx]]),
      at(p, [[0.445, hover - CAN.lidBase], [0.455, hover - CAN.lidBase + 0.5], [0.465, hover - CAN.lidBase + 0.3], [0.478, 0.36 - CAN.lidBase], [0.57, 0.36 - CAN.lidBase], [0.578, hover - CAN.lidBase + 0.3], [0.584, hover - CAN.lidBase + 0.5], [0.588, hover - CAN.lidBase]]),
      0,
    );
    mouth.current.position.set(0, 0, 0);
    fill.current.position.set(jx, 0.45, 0);

    // Shadows follow their objects and fade as they lift.
    jarShadow.current.position.x = jx;
    canShadow.current.position.set(can.current.position.x, 0.002, can.current.position.z);
    const lift = Math.max(0, can.current.position.y - CAN.lidBase);
    (canShadow.current.material as MeshBasicMaterial).opacity = 0.26 * Math.max(0, 1 - lift / 1.2);

    // Pin the anatomy callouts to their parts.
    const objects: Record<AnchorPart, Object3D | null> = { lid: lid.current, jar: jar.current, label: label.current, pile: pile.current };
    const v = new Vector3();
    for (const [name, [part, point]] of Object.entries(anchorPoints)) {
      const el = story.anchors[name];
      const obj = objects[part];
      if (!el || !obj) continue;
      v.set(...point);
      if (name === "lid") v.y += lid.current?.position.y ?? 0;
      obj.localToWorld(v).project(camera);
      el.style.transform = `translate3d(${((v.x + 1) / 2) * size.width}px, ${((1 - v.y) / 2) * size.height}px, 0)`;
    }
  });

  const colors = capsuleColors(design.goals);

  return (
    <>
      <StoryCamera wide={wide} />
      {/* Mist backdrop so the frosted glass has a room to refract. */}
      <mesh position={[0, 3, -9]} scale={[90, 40, 1]}>
        <planeGeometry />
        <meshBasicMaterial color={palette.mist} toneMapped={false} />
      </mesh>
      <group ref={world}>
        <group ref={jar}>
          <Jar
            lid={toneHex(design.lid)}
            glass={design.glass}
            metal={design.metal}
            label={design.label}
            capsules={colors}
            rig={{ lid, label, pile }}
            clip={clip}
          />
        </group>
        <group ref={can}>
          <group ref={tilt}>
            <group ref={mouth} />
            <Canister
              position-y={-CAN.lidBase}
              color={toneHex(design.refill)}
              metal={design.metal}
              label={design.label}
              rig={{ lid: canLid }}
            />
          </group>
        </group>
        <group ref={spareLid} visible={false}>
          <mesh geometry={parts.Can_Lid}>
            <meshPhysicalMaterial color={palette.graphite} metalness={0.4} roughness={0.45} clearcoat={0.2} />
          </mesh>
        </group>
        <group ref={fill} />
        <PourStream colors={colors} from={mouth} to={fill} />
        <YearRing ring={ring} />
        <Lineup x={wide ? 1.6 : 0} step={wide ? [2, 1.5] : [1.2, 1.6]} />
        <SoftShadow ref={jarShadow} position={[0, 0.002, 0]} size={2.4} opacity={0.28} />
        <SoftShadow ref={canShadow} position={[0, 0.002, 0]} size={2.2} opacity={0.26} />
      </group>
    </>
  );
}
