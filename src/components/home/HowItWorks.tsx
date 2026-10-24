"use client";

import { Suspense, useRef, useState, type ReactNode } from "react";
import { Color, Euler, Matrix4, Quaternion, Vector3, type Group, type InstancedMesh } from "three";
import { useFrame } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { products, toneHex } from "@/lib/brand";
import { capsuleColors, startingSnapshot } from "@/lib/lab";
import { reducedMotion } from "@/lib/motion";
import ProductPair from "@/components/product/ProductPair";
import Jar from "@/components/product/Jar";
import { useParts } from "@/components/product/model";
import StudioLights from "@/components/canvas/StudioLights";
import FitCamera from "@/components/canvas/FitCamera";
import SoftShadow from "@/components/canvas/SoftShadow";
import Backdrop from "@/components/canvas/Backdrop";
import Handled, { allHandling, useHand } from "@/components/product/Handled";

type Hand = ReturnType<typeof useHand>["hand"];

const steps = [
  {
    title: "Build your formula",
    body: "Pick up to three goals when you build your jar. Each one adds its own capsule, blended to order for you.",
  },
  {
    title: "Keep the jar",
    body: "Your first box brings the frosted glass jar, printed with your name. It is the only one you buy.",
  },
  {
    title: "Refill each month",
    body: "A metal canister arrives every month. Skip, pause or switch formulas whenever you like.",
  },
];

// Grows its children in when `on`, shrinks them away when not.
function Stage({ on, children }: { on: boolean; children: ReactNode }) {
  const ref = useRef<Group>(null!);
  useFrame((_, dt) => {
    const g = ref.current;
    const k = 1 - Math.exp(-dt * 6);
    const s = g.scale.x + ((on ? 1 : 0) - g.scale.x) * k;
    g.scale.setScalar(Math.max(1e-4, s));
    g.visible = s > 0.01;
    g.rotation.y += ((on ? 0 : -1.2) - g.rotation.y) * k;
  });
  return (
    <group ref={ref} scale={1e-4}>
      {children}
    </group>
  );
}

// Three goals as three strands of capsules, twisting up into one formula.
const PER = 16;
const ORBIT = PER * 3;
const goals = products.slice(0, 3);
// Reused every frame instead of allocating 50 matrices a frame.
const scratch = { m: new Matrix4(), q: new Quaternion(), p: new Vector3(), s: new Vector3(), e: new Euler() };
function Formula() {
  const parts = useParts();
  const mesh = useRef<InstancedMesh>(null!);
  const painted = useRef(false);

  useFrame(({ clock }) => {
    // Held still, mid-twist, for reduced motion.
    const t = reducedMotion() ? 2 : clock.elapsedTime;
    const { m, q, p, s, e } = scratch;
    for (let i = 0; i < ORBIT; i++) {
      const strand = i % 3;
      // Each capsule climbs its strand and loops back to the bottom.
      const h = (Math.floor(i / 3) / PER + t * 0.06) % 1;
      const a = strand * ((Math.PI * 2) / 3) + h * Math.PI * 3 + t * 0.5;
      const r = 0.25 + 0.4 * Math.sin(h * Math.PI);
      p.set(Math.cos(a) * r, 0.15 + h * 2.1, Math.sin(a) * r);
      q.setFromEuler(e.set(0.6, -a, Math.PI / 2 - 0.5));
      s.setScalar(1.7 * Math.min(1, Math.sin(h * Math.PI) * 2.2));
      mesh.current.setMatrixAt(i, m.compose(p, q, s));
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (!painted.current) {
      const c = new Color();
      for (let i = 0; i < ORBIT; i++) mesh.current.setColorAt(i, c.set(toneHex(goals[i % 3].tone)));
      mesh.current.instanceColor!.needsUpdate = true;
      painted.current = true;
    }
  });

  return (
    <instancedMesh ref={mesh} args={[parts.Capsule, undefined, ORBIT]} frustumCulled={false}>
      <meshPhysicalMaterial roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.2} />
    </instancedMesh>
  );
}

const pair = { ...startingSnapshot("pillow-talk"), goals: goals.map((g) => g.id) };

function HowScene({ step, hand }: { step: number; hand: Hand }) {
  return (
    <group position-y={-0.95}>
      <Backdrop />
      <Stage on={step === 0}>
        <Formula />
        <SoftShadow position={[0, 0.002, 0]} size={2.6} opacity={0.12} />
      </Stage>
      <Stage on={step === 1}>
        <Handled hand={hand} handling={allHandling} floor={<SoftShadow position={[0, 0.002, 0]} size={2.4} opacity={0.28} />}>
          {(rig) => (
            <Jar
              lid={toneHex("sage")}
              glass="frosted"
              metal="satin"
              label={{ text: "Yours", font: "display" }}
              capsules={capsuleColors(pair.goals)}
              rig={rig}
            />
          )}
        </Handled>
      </Stage>
      <Stage on={step === 2}>
        <ProductPair design={pair} handle={{ hand, handling: allHandling }} backdrop={false} />
      </Stage>
    </group>
  );
}

// "How it works" as a stepper: each step shows its own 3D moment, and the
// steps play through on their own until someone picks one.
export default function HowItWorks() {
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const handle = useHand(allHandling);

  return (
    <section id="how" className="frame screen bg-white py-24">
      <div className="mb-12 grid grid-cols-1 items-end gap-6 md:mb-8 md:grid-cols-2">
        <h2 className="font-display text-5xl leading-none md:text-6xl">How it works</h2>
        <p className="max-w-md text-lg leading-relaxed text-muted md:justify-self-end">
          Three steps, once. After that it looks after itself.
        </p>
      </div>

      <div className="grid grid-cols-1 items-center gap-10 md:min-h-0 md:flex-1 md:grid-cols-2 md:gap-16">
        <ol className="flex flex-col gap-2">
          {steps.map((s, i) => {
            const active = i === step;
            return (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => {
                    setStep(i);
                    setAuto(false);
                  }}
                  aria-current={active ? "step" : undefined}
                  className={`group relative flex w-full gap-6 overflow-hidden rounded-2xl px-6 py-6 text-left transition-colors duration-500 ${active ? "bg-mist" : "hover:bg-mist/60"}`}
                >
                  <span className={`font-display text-5xl leading-none transition-colors duration-500 ${active ? "text-graphite" : "text-graphite/55 group-hover:text-graphite/75"}`}>
                    0{i + 1}
                  </span>
                  <span className="flex flex-col gap-2 pt-1">
                    <span className={`text-2xl transition-colors duration-500 ${active ? "text-graphite" : "text-graphite/65 group-hover:text-graphite/85"}`}>{s.title}</span>
                    <span
                      className={`grid text-lg leading-relaxed text-muted transition-[grid-template-rows,opacity] duration-500 ${active ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                    >
                      <span className="overflow-hidden">{s.body}</span>
                    </span>
                  </span>
                  {/* Fills while a step plays, then hands over to the next. */}
                  {active && auto && (
                    <span
                      key={step}
                      onAnimationEnd={() => setStep((step + 1) % steps.length)}
                      className="absolute bottom-0 left-0 h-1 w-full origin-left animate-[grow_6s_linear] bg-graphite/80 motion-reduce:hidden"
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ol>

        <div className={`h-[46vh] select-none overflow-hidden rounded-3xl bg-mist p-2 md:h-full ${step > 0 ? handle.cursor : ""}`} {...handle.props}>
          <View className="h-full w-full">
            <FitCamera width={4.4} minDistance={8.6} />
            <StudioLights />
            <Suspense fallback={null}>
              <HowScene step={step} hand={handle.hand} />
            </Suspense>
          </View>
        </div>
      </div>
    </section>
  );
}
