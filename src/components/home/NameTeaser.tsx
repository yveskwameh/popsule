"use client";

import { Suspense, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import type { ToneId } from "@/lib/brand";
import { encodeSnapshot, LABEL_MAX, priceOf, startingSnapshot, type Glass, type LabelFont } from "@/lib/lab";
import ProductPair from "@/components/product/ProductPair";
import StudioLights from "@/components/canvas/StudioLights";
import NearView from "@/components/canvas/NearView";
import FitCamera from "@/components/canvas/FitCamera";
import Backdrop from "@/components/canvas/Backdrop";
import { allHandling, useHand } from "@/components/product/Handled";
import { Pair, Tones } from "@/components/ui/choices";

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-muted">{label}</span>
      <div className="flex items-center gap-1.5">{children}</div>
    </div>
  );
}

// "Make it yours, right here": a big stage you can turn by hand, with a
// floating dock of the choices that matter most. Build your jar has the rest.
export default function NameTeaser() {
  const [text, setText] = useState("Your name");
  const [font, setFont] = useState<LabelFont>("display");
  const [lid, setLid] = useState<ToneId>("clay");
  const [refill, setRefill] = useState<ToneId>("clay");
  const [glass, setGlass] = useState<Glass>("frosted");

  const handle = useHand(allHandling);
  const design = useMemo(
    () => ({
      ...startingSnapshot("head-space"),
      lid,
      refill,
      matchRefill: lid === refill,
      glass,
      label: { text: text || " ", font },
    }),
    [text, font, lid, refill, glass],
  );

  return (
    <section data-section="Make yours" className="frame screen bg-white py-24">
      <div className="mb-10 grid grid-cols-1 items-end gap-6 md:mb-6 md:grid-cols-2">
        <div>
          <p className="text-lg italic text-muted">Try it here</p>
          <h2 className="font-display text-5xl leading-none md:text-6xl">Make it yours.</h2>
        </div>
        <p className="max-w-md text-lg leading-relaxed text-muted md:justify-self-end">
          Every jar is printed for one person. Choose the name, lettering, tones and glass. Drag to turn it, click to open it.
        </p>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-mist">
        <div className={`h-[52vh] min-h-0 select-none px-2 pt-2 md:h-auto md:flex-1 ${handle.cursor}`} {...handle.props}>
          <NearView className="h-full w-full">
            <FitCamera width={4.4} minDistance={6.6} />
            <StudioLights />
            <Suspense fallback={null}>
              <Backdrop />
              <group position-y={-0.6}>
                <ProductPair design={design} handle={{ hand: handle.hand, handling: allHandling }} backdrop={false} />
              </group>
            </Suspense>
          </NearView>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-[15] flex items-start justify-between gap-4 p-5 md:p-8">
          <p className="hidden text-lg md:block">
            <span className="font-display text-3xl">{text || "Your name"}</span>
            <span className="block text-base italic text-muted">From ${priceOf(design).total} a month</span>
          </p>
          <Link
            href={`/build?d=${encodeSnapshot(design)}`}
            data-magnetic
            className="pointer-events-auto ml-auto inline-flex h-10 items-center whitespace-nowrap rounded-full bg-cta px-5 text-base text-on-cta hover:bg-cta-hover md:h-12 md:px-6 md:text-lg"
          >
            Build the rest
          </Link>
        </div>

        {/* The dock sits under the stage, inside the same panel. */}
        <div className="relative z-[15] p-3 md:p-4">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 rounded-2xl bg-white p-5 md:px-6 md:py-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm text-muted">Name on the label</span>
              <input
                value={text}
                maxLength={LABEL_MAX}
                onChange={(e) => setText(e.target.value)}
                className="h-10 w-48 rounded-full bg-mist px-4 text-lg outline-none focus:ring-2 focus:ring-graphite/30"
              />
            </label>
            <Group label="Lettering">
              <Pair value={font} options={["display", "serif"] as const} onChange={setFont} render={(f) => (f === "display" ? "Classic" : <em>Italic</em>)} />
            </Group>
            <Group label="Jar lid">
              <Tones value={lid} onChange={setLid} label="Jar lid tone" />
            </Group>
            <Group label="Refill">
              <Tones value={refill} onChange={setRefill} label="Refill tone" />
            </Group>
            <Group label="Glass">
              <Pair value={glass} options={["frosted", "clear"] as const} onChange={setGlass} render={(g) => (g === "frosted" ? "Frosted" : "Clear")} />
            </Group>
          </div>
        </div>
      </div>
    </section>
  );
}
