"use client";

import { Suspense } from "react";
import Link from "next/link";
import { View } from "@react-three/drei";
import { products, toneHex, type Product } from "@/lib/brand";
import { capsuleColors, encodeSnapshot, priceOf, startingSnapshot } from "@/lib/lab";
import Jar from "@/components/product/Jar";
import StudioLights from "@/components/canvas/StudioLights";
import FitCamera from "@/components/canvas/FitCamera";
import SoftShadow from "@/components/canvas/SoftShadow";
import Backdrop from "@/components/canvas/Backdrop";
import Handled, { allHandling, useHand } from "@/components/product/Handled";

const shelfHandling = allHandling;

// One jar on a card, handled like every other jar: lean, peek, spin and open.
// The "Make it yours" button underneath takes it to Build your jar.
function ShelfJar({ product, hand }: { product: Product; hand: ReturnType<typeof useHand>["hand"] }) {
  return (
    <group position-y={-0.85}>
      <Backdrop />
      <Handled hand={hand} handling={shelfHandling} floor={<SoftShadow position={[0, 0.002, 0]} size={2.4} opacity={0.26} />}>
        {(rig) => (
          <Jar
            lid={toneHex(product.tone)}
            glass="frosted"
            metal="satin"
            label={{ text: product.name, font: "display" }}
            capsules={capsuleColors([product.id])}
            rig={rig}
          />
        )}
      </Handled>
    </group>
  );
}

function Card({ product: p }: { product: Product }) {
  const handle = useHand(shelfHandling);
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl bg-mist">
      <div className={`aspect-[4/5] w-full select-none px-2 pt-2 md:aspect-auto md:h-[32svh] ${handle.cursor}`} {...handle.props}>
        <View className="h-full w-full">
          <FitCamera width={2} minDistance={6.2} height={0.6} />
          <StudioLights />
          <Suspense fallback={null}>
            <ShelfJar product={p} hand={handle.hand} />
          </Suspense>
        </View>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-5 pb-5">
        <span className="font-display text-4xl leading-none">{p.name}</span>
        <span className="text-lg">
          For {p.goal.toLowerCase()} <span className="text-muted">· from ${from} a month</span>
        </span>
        <ul className="flex flex-wrap gap-2">
          {p.ingredients.map((x) => (
            <li key={x} className="rounded-full bg-white px-3 py-1 text-base">
              {x}
            </li>
          ))}
        </ul>
        {/* A dark arrow circle that stretches open under the words on hover. */}
        <Link
          href={`/build?d=${encodeSnapshot(startingSnapshot(p.id))}`}
          data-magnetic
          className="group relative mt-auto inline-flex h-12 items-center self-start whitespace-nowrap rounded-full pl-16 pr-6 text-lg"
        >
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 w-12 rounded-full bg-graphite transition-[width] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:w-full group-focus-visible:w-full"
          />
          <svg
            aria-hidden
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3.5 text-white transition-transform duration-500 group-hover:translate-x-1"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
          <span className="relative transition-colors duration-300 group-hover:text-white group-focus-visible:text-white">Make it yours</span>
        </Link>
      </div>
    </div>
  );
}

const from = priceOf({ size: 30, goals: ["pillow-talk"], metal: "satin" }).total;

export default function RangeShelf() {
  return (
    <section id="range" data-section="Range" className="frame screen bg-white pb-24">
      <div className="mb-12 grid grid-cols-1 items-end gap-6 md:mb-8 md:grid-cols-2">
        <h2 className="font-display text-5xl leading-none md:text-6xl">The range</h2>
        <p className="max-w-md text-lg leading-relaxed text-muted md:justify-self-end">
          Four starting formulas, each with its own tone. Drag a jar to turn it, click to open it, or mix up to three when you build yours.
        </p>
      </div>
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <li key={p.id}>
            <Card product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}
