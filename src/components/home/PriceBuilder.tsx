"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { View } from "@react-three/drei";
import { products, toneHex, type ProductId } from "@/lib/brand";
import { encodeSnapshot, MAX_GOALS, priceOf, sizes, startingSnapshot, type Metal } from "@/lib/lab";
import ProductPair from "@/components/product/ProductPair";
import StudioLights from "@/components/canvas/StudioLights";
import FitCamera from "@/components/canvas/FitCamera";
import Backdrop from "@/components/canvas/Backdrop";
import { allHandling, useHand } from "@/components/product/Handled";

const perDay = ["One a day", "Two a day", "Three a day"];

// Pricing you play with rather than read: drag for size, tap goals in and out,
// flip the finish. The total and the jar answer straight away.
export default function PriceBuilder() {
  const [sizeIndex, setSizeIndex] = useState(1);
  const [goals, setGoals] = useState<ProductId[]>(["pillow-talk"]);
  const [metal, setMetal] = useState<Metal>("satin");
  const size = sizes[sizeIndex];
  const handle = useHand(allHandling);

  const design = useMemo(() => ({ ...startingSnapshot("pillow-talk"), size, metal, goals }), [size, metal, goals]);
  const price = priceOf(design);

  const toggle = (id: ProductId) =>
    setGoals((g) => (g.includes(id) ? (g.length > 1 ? g.filter((x) => x !== id) : g) : g.length < MAX_GOALS ? [...g, id] : g));

  return (
    <section id="pricing" data-section="Pricing" className="frame screen bg-mist py-24">
      <div className="mb-12 grid grid-cols-1 items-end gap-6 md:mb-8 md:grid-cols-2">
        <h2 className="font-display text-5xl leading-none md:text-6xl">One price a month</h2>
        <p className="max-w-md text-lg leading-relaxed text-muted md:justify-self-end">
          The jar ships free with your first refill. Change anything, any month.
        </p>
      </div>

      <div className="grid grid-cols-1 items-center gap-12 md:min-h-0 md:flex-1 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-16">
        <div className="flex flex-col gap-8">
          <div>
            <p className="text-lg text-muted">
              Capsules a day <span className="italic">· the jar and refill grow to match</span>
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2" role="radiogroup" aria-label="Capsules a day">
              {perDay.map((label, n) => {
                const on = sizeIndex === n;
                return (
                  <button
                    key={label}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setSizeIndex(n)}
                    className={`flex flex-col items-center gap-2 rounded-2xl px-2 py-3 transition-colors duration-300 ${on ? "bg-graphite text-white" : "bg-white text-graphite hover:bg-white/60"}`}
                  >
                    <span className="flex gap-1.5" aria-hidden>
                      {[0, 1, 2].map((c) => (
                        <span key={c} className={`block h-6 w-3 rounded-full bg-current transition-opacity duration-300 ${c <= n ? "" : "opacity-20"}`} />
                      ))}
                    </span>
                    <span className="text-base">{label}</span>
                    <span className={`text-sm ${on ? "text-white/60" : "text-muted"}`}>{sizes[n]} a month</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-lg text-muted">
              Goals in your formula <span className="italic">· pick up to three</span>
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {products.map((p) => {
                const on = goals.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggle(p.id)}
                    className={`inline-flex items-center gap-2.5 rounded-full py-2 pl-2.5 pr-4 text-lg transition-colors duration-300 ${on ? "bg-graphite text-white" : "bg-white hover:bg-white/60"}`}
                  >
                    <span className="h-5 w-5 rounded-full" style={{ background: toneHex(p.tone) }} />
                    {p.goal}
                  </button>
                );
              })}
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between gap-6">
            <span>
              <span className="block text-lg">Brushed metal</span>
              <span className="block text-base italic text-muted">A fine grain on the lid and refill, +$2</span>
            </span>
            <input
              type="checkbox"
              role="switch"
              checked={metal === "brushed"}
              onChange={(e) => setMetal(e.target.checked ? "brushed" : "satin")}
              className="peer sr-only"
            />
            <span className="relative h-8 w-14 shrink-0 rounded-full bg-graphite/15 transition-colors duration-300 peer-checked:bg-graphite peer-focus-visible:ring-2 peer-focus-visible:ring-graphite/40 after:absolute after:left-1 after:top-1 after:h-6 after:w-6 after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-300 peer-checked:after:translate-x-6" />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-white p-5 md:p-6">
            <div>
              <p className="font-display text-6xl leading-none tabular-nums">
                ${price.total}
                <span className="ml-2 font-sans text-lg font-normal tracking-normal text-muted">a month</span>
              </p>
              <p className="mt-2 text-base text-muted">
                {size} capsules ${price.base}
                {price.goals > 0 && ` · ${goals.length - 1} extra ${goals.length > 2 ? "goals" : "goal"} $${price.goals}`}
                {price.finish > 0 && ` · brushed $${price.finish}`}
                {" · "}glass jar free
              </p>
            </div>
            <Link
              href={`/build?d=${encodeSnapshot(design)}`}
              data-magnetic
              className="inline-flex h-12 items-center rounded-full bg-graphite px-7 text-lg text-white hover:bg-black"
            >
              Start with this
            </Link>
          </div>
        </div>

        <div className="md:h-full">
          <div className={`h-[46vh] select-none md:h-full ${handle.cursor}`} {...handle.props}>
            <View className="h-full w-full">
              <FitCamera width={4.3} minDistance={7.6} />
              <StudioLights />
              <Suspense fallback={null}>
                <Backdrop />
                <group position-y={-0.85}>
                  <ProductPair design={design} handle={{ hand: handle.hand, handling: allHandling }} backdrop={false} />
                </group>
              </Suspense>
            </View>
          </div>
        </div>
      </div>
    </section>
  );
}
