"use client";

import { useRef, type PointerEvent as ReactPointerEvent, type ReactNode, type RefObject } from "react";
import { Vector3, type Group } from "three";
import { useFrame } from "@react-three/fiber";

// Jars you can handle: lean towards the cursor, peek under the lid, spin by
// hand, click to open. The DOM side (useHand) records the pointer; the 3D side
// (<Handled>) reads it every frame and moves the jar.

export type Handling = { lean?: boolean; peek?: boolean; spin?: boolean; open?: boolean };
export const allHandling: Handling = { lean: true, peek: true, spin: true, open: true };

export type Hand = {
  x: number; // -1..1 across the stage, left to right
  y: number; // -1..1 down the stage, top to bottom
  inside: boolean;
  dragging: boolean;
  lastX: number;
  moved: number;
  pressed: boolean; // a press started on the stage, not on a control
  pressId: number; // bumps on every press, so each object can claim the drag
  velocity: number; // spin while dragging, radians per frame
  click: { x: number; y: number; at: number }; // last click; each object checks if it was hit
};

const ease = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
const clamp = (v: number, a: number) => Math.max(-a, Math.min(a, v));

// Open: the lid twists off and the capsules hop, then it all closes again.
export function openCurve(openedAt: number) {
  const since = openedAt < 0 ? 99 : (performance.now() - openedAt) / 1000;
  const up = ease(clamp01(since / 0.45)) * (1 - ease(clamp01((since - 1.4) / 0.5)));
  const hop = Math.max(0, Math.sin(clamp01((since - 0.3) / 0.9) * Math.PI));
  return { up, hop };
}

// The pointer handlers for the element that wraps a jar's <View>.
export function useHand(handling: Handling) {
  const hand = useRef<Hand>({
    x: 0,
    y: 0,
    inside: false,
    dragging: false,
    lastX: 0,
    moved: 0,
    pressed: false,
    pressId: 0,
    velocity: 0,
    click: { x: 0, y: 0, at: -1 },
  });

  const point = (e: ReactPointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    hand.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    hand.current.y = ((e.clientY - r.top) / r.height) * 2 - 1;
  };

  const props = {
    style: { touchAction: handling.spin ? "pan-y" : "auto" } as const,
    // Read by the custom cursor, which grows into a label over the stage.
    "data-cursor": handling.spin ? "Drag" : handling.open ? "Open" : undefined,
    onPointerEnter: (e: ReactPointerEvent<HTMLElement>) => {
      hand.current.inside = true;
      point(e);
    },
    onPointerLeave: () => {
      hand.current.inside = false;
      hand.current.dragging = false;
    },
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => {
      // Let real controls inside the stage (buttons, links) do their own thing.
      if ((e.target as HTMLElement).closest("button, a, input, label")) return;
      point(e);
      hand.current.inside = true;
      hand.current.pressed = true;
      hand.current.pressId++;
      hand.current.moved = 0;
      hand.current.lastX = e.clientX;
      if (handling.spin) {
        hand.current.dragging = true;
        e.currentTarget.setPointerCapture(e.pointerId);
      }
    },
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => {
      point(e);
      if (hand.current.pressed) hand.current.moved += Math.abs(e.clientX - hand.current.lastX);
      if (hand.current.dragging) hand.current.velocity = (e.clientX - hand.current.lastX) * 0.012;
      hand.current.lastX = e.clientX;
    },
    onPointerUp: (e: ReactPointerEvent<HTMLElement>) => {
      const pressed = hand.current.pressed;
      hand.current.pressed = false;
      hand.current.dragging = false;
      // A click, not the end of a drag. Whichever object it landed on opens.
      if (handling.open && pressed && hand.current.moved < 6) hand.current.click = { x: hand.current.x, y: hand.current.y, at: performance.now() };
      if (e.pointerType !== "mouse") hand.current.inside = false;
    },
  };

  const cursor = handling.spin ? "cursor-grab active:cursor-grabbing" : handling.open ? "cursor-pointer" : "";
  return { hand, props, cursor };
}

type Rig = { lid: RefObject<Group | null>; pile: RefObject<Group | null> };

// Wraps one object (the jar, or the refill) and moves it with the hand. It only
// answers when the pointer is over its own outline on screen, so two objects on
// one stage react separately. Children get the lid and capsule handles.
export default function Handled({
  hand,
  handling,
  lift = 0.6,
  bounds = [0.85, 1.85],
  recenter = true,
  floor,
  children,
}: {
  hand: RefObject<Hand>;
  handling: Handling;
  lift?: number; // how far the lid rises when opened
  bounds?: [number, number]; // half width and height of the object, for hit testing
  recenter?: boolean; // drop by half the lid's lift so an opened jar stays centred
  floor?: ReactNode; // the shadow: re-centres with the jar but doesn't tip or spin
  children: (rig: Rig) => ReactNode;
}) {
  const center = useRef<Group>(null!);
  const lean = useRef<Group>(null!);
  const spin = useRef<Group>(null!);
  const lid = useRef<Group>(null);
  const pile = useRef<Group>(null);
  const slosh = useRef({ x: 0, v: 0 });
  const turn = useRef(0);
  const own = useRef({ pressId: 0, holding: false, clickAt: -1, openedAt: -1 });
  const lo = useRef(new Vector3());
  const hi = useRef(new Vector3());

  useFrame(({ camera }, dt) => {
    const h = hand.current;
    const o = own.current;
    const k = 1 - Math.exp(-dt * 6);

    // Where this object sits on screen (in the stage's -1..1 space, y down).
    const a = center.current.localToWorld(lo.current.set(-bounds[0], 0, 0)).project(camera);
    const b = center.current.localToWorld(hi.current.set(bounds[0], bounds[1], 0)).project(camera);
    const x0 = Math.min(a.x, b.x);
    const x1 = Math.max(a.x, b.x);
    const y0 = Math.min(-a.y, -b.y);
    const y1 = Math.max(-a.y, -b.y);
    const hits = (x: number, y: number) => x > x0 && x < x1 && y > y0 && y < y1;
    const over = h.inside && hits(h.x, h.y);

    // A press that starts on this object owns the drag; a click on it opens it.
    if (h.pressId !== o.pressId) {
      o.pressId = h.pressId;
      o.holding = hits(h.x, h.y);
    }
    if (!h.dragging) o.holding = false;
    if (h.click.at !== o.clickAt) {
      o.clickAt = h.click.at;
      if (hits(h.click.x, h.click.y)) o.openedAt = h.click.at;
    }

    // Lean: tip towards the cursor, measured from this object's own centre.
    const tx = handling.lean && over ? clamp(((h.x - (x0 + x1) / 2) / (x1 - x0)) * 2, 1) : 0;
    const ty = handling.lean && over ? clamp(((h.y - (y0 + y1) / 2) / (y1 - y0)) * 2, 1) : 0;
    lean.current.rotation.z += (-tx * 0.14 - lean.current.rotation.z) * k;

    // The capsules lag on a spring and swirl. They turn about the jar's axis
    // and barely shift, so none of them can poke through the glass.
    const s = slosh.current;
    s.v += (tx - s.x) * 0.12 - s.v * 0.14;
    s.x += s.v;

    // Spin: turn by hand, coast, then settle back on the label.
    if (handling.spin) {
      turn.current = o.holding ? h.velocity : turn.current * Math.pow(0.04, dt);
      spin.current.rotation.y += turn.current;
    }
    if (!o.holding && Math.abs(turn.current) < 0.0005) {
      const r = spin.current.rotation.y;
      const front = Math.round(r / (Math.PI * 2)) * Math.PI * 2;
      spin.current.rotation.y += (front - r) * k * 0.4;
    }

    // Peek on the top half, open on click.
    const peeking = handling.peek && over && h.y < (y0 + y1) / 2;
    const { up, hop } = handling.open ? openCurve(o.openedAt) : { up: 0, hop: 0 };
    const target = Math.max(peeking ? 0.12 : 0, up * lift);
    // While open, tip the top towards the viewer so you can see inside.
    lean.current.rotation.x += (ty * 0.1 + up * 0.35 - lean.current.rotation.x) * k;
    if (lid.current) {
      lid.current.position.y += (target - lid.current.position.y) * (up > 0 ? 1 : k);
      lid.current.rotation.y = -up * 2.2;
      if (recenter) center.current.position.y = -lid.current.position.y / 2;
    }
    if (pile.current) {
      pile.current.position.x = clamp(s.x * 0.03, 0.03);
      pile.current.rotation.y = s.x * 0.9;
      pile.current.position.y = hop * lift * 0.9;
    }
  });

  return (
    <group ref={center}>
      {floor}
      <group ref={lean}>
        <group ref={spin}>{children({ lid, pile })}</group>
      </group>
    </group>
  );
}
