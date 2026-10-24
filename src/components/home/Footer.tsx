"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { View } from "@react-three/drei";
import { palette, products, toneHex } from "@/lib/brand";
import { capsuleColors, encodeSnapshot, startingSnapshot } from "@/lib/lab";
import Jar from "@/components/product/Jar";
import StudioLights from "@/components/canvas/StudioLights";
import FitCamera from "@/components/canvas/FitCamera";
import Handled, { allHandling, useHand } from "@/components/product/Handled";
import SoftShadow from "@/components/canvas/SoftShadow";

const columns = [
  { title: "Shop", links: [["Build your jar", "/build"], ["The range", "#range"], ["Pricing", "#pricing"]] },
  { title: "Help", links: [["How it works", "#how"], ["Questions", "#questions"], ["Shipping and returns", "#questions"]] },
  { title: "Popsule", links: [["Our glass", "#how"], ["Refill programme", "#how"], ["Instagram", "#"]] },
] as const;

// A last look at the jar, then the usual footer: links, a refill-reminder
// signup and the wordmark, shown whole.
export default function Footer() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const p = products[1];
  const handle = useHand(allHandling);

  return (
    <footer className="bg-white">
      {/* Closing call to action. */}
      <div className="frame">
        <div className="grid grid-cols-1 items-center overflow-hidden rounded-3xl bg-graphite text-white md:grid-cols-2">
          <div className="flex flex-col gap-6 p-8 md:p-14">
            <p className="text-lg italic text-white/60">Ready when you are</p>
            <h2 className="font-display text-5xl leading-none md:text-6xl">Your jar is waiting.</h2>
            <p className="max-w-md text-xl leading-relaxed text-white/75">
              Build your formula in a few minutes. The jar arrives with your first refill, printed with your name.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/build" data-magnetic className="inline-flex h-14 items-center rounded-full bg-white px-8 text-lg text-graphite hover:bg-mist">
                Design yours
              </Link>
              <a href="#range" data-magnetic className="inline-flex h-14 items-center rounded-full px-6 text-lg text-white/80 hover:text-white">
                See the range
              </a>
            </div>
          </div>
          <div className={`h-72 select-none p-2 md:h-[30rem] ${handle.cursor}`} {...handle.props}>
            <View className="h-full w-full">
              <FitCamera width={2.4} minDistance={6.4} height={0.55} />
              <StudioLights />
              <Suspense fallback={null}>
                <group position-y={-0.85}>
                  {/* Graphite backdrop so the frosted glass refracts the card, not the page. */}
                  <mesh position={[0, 3, -6]} scale={[60, 30, 1]}>
                    <planeGeometry />
                    <meshBasicMaterial color={palette.graphite} toneMapped={false} />
                  </mesh>
                  <Handled hand={handle.hand} handling={allHandling} floor={<SoftShadow position={[0, 0.002, 0]} size={2.4} opacity={0.5} />}>
                    {(rig) => (
                      <Jar
                        lid={toneHex(p.tone)}
                        glass="frosted"
                        metal="satin"
                        label={{ text: "Yours", font: "display" }}
                        capsules={capsuleColors([p.id])}
                        rig={rig}
                      />
                    )}
                  </Handled>
                </group>
              </Suspense>
            </View>
          </div>
        </div>
      </div>

      {/* Links and signup. */}
      <div className="frame grid grid-cols-2 gap-x-8 gap-y-12 pb-12 pt-20 md:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.6fr)] md:pb-14 md:pt-24">
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="text-base text-muted">{c.title}</p>
            <ul className="mt-4 flex flex-col gap-2 text-lg">
              {c.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="hover:text-muted">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="col-span-2 md:col-span-1">
          <p className="text-base text-muted">Refill reminders</p>
          <p className="mt-4 text-lg leading-relaxed">One email before each refill ships. Nothing else.</p>
          {/* No mailing list yet: the form only says thanks. */}
          {sent ? (
            <p className="mt-4 rounded-full bg-mist px-5 py-3 text-lg">Thank you, you are on the list.</p>
          ) : (
            <form
              className="mt-4 flex items-center gap-2 rounded-full bg-mist p-1.5 pl-5 focus-within:ring-2 focus-within:ring-graphite/20"
              onSubmit={(e) => {
                e.preventDefault();
                if (email.includes("@")) setSent(true);
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email"
                aria-label="Your email"
                className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-muted"
              />
              <button type="submit" data-magnetic className="h-11 shrink-0 rounded-full bg-graphite px-5 text-lg text-white hover:bg-black">
                Sign up
              </button>
            </form>
          )}
          <ul className="mt-6 flex flex-wrap gap-2">
            {products.map((x) => (
              <li key={x.id}>
                <Link
                  href={`/build?d=${encodeSnapshot(startingSnapshot(x.id))}`}
                  className="inline-flex items-center gap-2 rounded-full bg-mist py-1.5 pl-2 pr-3.5 text-base hover:bg-line"
                >
                  <span className="h-4 w-4 rounded-full" style={{ background: toneHex(x.tone) }} />
                  {x.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* The wordmark spans the frame exactly, so its edges line up with the
          links above and the small print below. */}
      <div className="frame pb-8">
        <div className="@container">
          <p aria-hidden className="select-none whitespace-nowrap font-display text-[33cqw] leading-[0.82]">
            Popsule
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-2 text-base text-muted sm:flex-row sm:justify-between">
          <p>© 2026 Popsule. All rights reserved.</p>
          <p className="flex gap-5">
            <a href="#" className="hover:text-graphite">
              Privacy
            </a>
            <a href="#" className="hover:text-graphite">
              Terms
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
