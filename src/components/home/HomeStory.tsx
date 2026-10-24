"use client";

import { Suspense, useEffect, useRef } from "react";
import Link from "next/link";
import { View } from "@react-three/drei";
import { gsap, useGSAP } from "@/lib/gsap";
import { products, toneHex } from "@/lib/brand";
import { encodeSnapshot, startingSnapshot } from "@/lib/lab";
import { chapters, HANDLE_UNTIL, rangeStep, story, type Chapter } from "@/lib/story";
import StudioLights from "@/components/canvas/StudioLights";
import StoryScene from "./StoryScene";

const callouts = [
  { id: "lid", side: "right", title: "Anodised aluminium lid", body: "Coloured to match your formula." },
  { id: "thread", side: "left", title: "Airtight screw seal", body: "Keeps capsules dry for the month." },
  { id: "label", side: "left", title: "Your name, printed", body: "Ceramic ink, fired onto the glass." },
  { id: "glass", side: "right", title: "Frosted glass", body: "Shades the capsules from light. Dishwasher safe." },
  { id: "capsules", side: "right", title: "Capsules, made to order", body: "Blended for your goals, never sitting in a warehouse." },
] as const;

const steps = [
  { title: "Open the jar", body: "When it runs low, unscrew the lid. The jar stays on your shelf." },
  { title: "Pour in the refill", body: "The month's capsules arrive in a sealed aluminium canister." },
  { title: "Send the can back", body: "Drop it in the prepaid sleeve. We clean it and fill it again." },
];

const stats = [
  { value: "1", unit: "jar", body: "Bought once. Kept for life." },
  { value: "12", unit: "refills", body: "A year of capsules, one canister a month." },
  { value: "0", unit: "plastic", body: "Glass, aluminium and paper. Nothing to throw away." },
];

// The pinned film at the top of the home page.
export default function HomeStory() {
  const track = useRef<HTMLDivElement>(null!);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      story.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      story.mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerdown", move);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", move);
    };
  }, []);

  useGSAP(
    () => {
      const q = gsap.utils.selector(track);
      const tl = gsap.timeline({
        defaults: { ease: "power2.out", duration: 0.02 },
        scrollTrigger: { trigger: track.current, start: "top top", end: "bottom bottom", scrub: 0.8 },
      });
      // The clock everything else reads. One unit of timeline = the whole track.
      tl.to(story, { p: 1, ease: "none", duration: 1 }, 0);

      // Chapter text drifts up out of a soft blur, line by line, and leaves the same way.
      const blockIn = { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.035, stagger: 0.006, ease: "power3.out" };
      const blockOut = { opacity: 0, y: -28, filter: "blur(6px)", duration: 0.03, stagger: 0.004, ease: "power2.in" };
      const show = (ch: Chapter, from: number, to?: number) => {
        const lines = q(`[data-ch=${ch}] [data-block] > *`);
        tl.set(q(`[data-ch=${ch}]`), { autoAlpha: 1 }, from);
        tl.fromTo(lines, { opacity: 0, y: 36, filter: "blur(6px)" }, blockIn, from);
        if (to === undefined) return;
        tl.to(lines, blockOut, to - 0.04);
        tl.set(q(`[data-ch=${ch}]`), { autoAlpha: 0 }, to);
      };

      // Hero is visible on load and leaves as the jar starts to open.
      tl.to(q("[data-ch=hero] [data-block] > *"), blockOut, chapters.hero[1] - 0.06);
      tl.set(q("[data-ch=hero]"), { autoAlpha: 0 }, chapters.hero[1]);
      tl.to(q("[data-cue]"), { autoAlpha: 0, duration: 0.02 }, 0.01);

      const timed: Chapter[] = ["anatomy", "refill", "year", "range"];
      for (const ch of timed) {
        const [a, b] = chapters[ch];
        show(ch, a + 0.005, ch === "range" ? undefined : b);
      }

      // Callouts draw their leader line out from the part, then the words fade in.
      tl.fromTo(q("[data-line]"), { scaleX: 0 }, { scaleX: 1, duration: 0.02, stagger: 0.006, ease: "power2.out" }, 0.215);
      tl.fromTo(q("[data-callout]"), { autoAlpha: 0, filter: "blur(4px)" }, { autoAlpha: 1, filter: "blur(0px)", duration: 0.025, stagger: 0.006 }, 0.22);
      tl.to(q("[data-callout]"), { autoAlpha: 0, filter: "blur(4px)", duration: 0.02 }, 0.29);
      tl.to(q("[data-line]"), { scaleX: 0, duration: 0.02 }, 0.29);

      // Refill steps: a counter rolls to the next number, a bar fills with the
      // scroll through each step, and the step text slides through a window.
      const stepAt = [chapters.refill[0] + 0.02, 0.445, 0.57, chapters.refill[1] - 0.005];
      q("[data-fill]").forEach((el, i) => {
        tl.fromTo(el, { scaleX: 0 }, { scaleX: 1, ease: "none", duration: stepAt[i + 1] - stepAt[i] }, stepAt[i]);
      });
      q("[data-step]").forEach((el, i) => {
        if (i > 0) tl.fromTo(el, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.018, ease: "power3.out" }, stepAt[i]);
        if (i < 2) tl.to(el, { yPercent: -110, opacity: 0, duration: 0.018, ease: "power3.in" }, stepAt[i + 1] - 0.012);
      });
      [1, 2].forEach((i) => tl.to(q("[data-count]"), { yPercent: (-100 / 3) * i, duration: 0.018, ease: "power3.inOut" }, stepAt[i] - 0.006));

      // Year stats count in.
      tl.fromTo(q("[data-stat]"), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, stagger: 0.01 }, chapters.year[0] + 0.03);

      // Range: the turntable brings each formula forward; its details slide in
      // and the matching tone dot fills.
      q("[data-product]").forEach((el, i) => {
        const at = chapters.range[0] + i * rangeStep;
        if (i > 0) tl.fromTo(el, { yPercent: 40, autoAlpha: 0, filter: "blur(4px)" }, { yPercent: 0, autoAlpha: 1, filter: "blur(0px)", duration: 0.016 }, at);
        if (i < 3) tl.to(el, { yPercent: -40, autoAlpha: 0, filter: "blur(4px)", duration: 0.012 }, at + rangeStep - 0.012);
      });
      q("[data-dot]").forEach((el, i) => {
        const at = chapters.range[0] + i * rangeStep;
        if (i > 0) tl.fromTo(el, { scale: 0.55, opacity: 0.45 }, { scale: 1, opacity: 1, duration: 0.012 }, at);
        if (i < 3) tl.to(el, { scale: 0.55, opacity: 0.45, duration: 0.012 }, at + rangeStep);
      });
      [1, 2, 3].forEach((i) => tl.to(q("[data-range-count]"), { yPercent: -25 * i, duration: 0.012, ease: "power3.inOut" }, chapters.range[0] + i * rangeStep - 0.006));
    },
    { scope: track },
  );

  return (
    <section ref={track} className="relative h-[1000vh] bg-mist" aria-label="How Popsule works">
      {/* Sticky makes its own stacking context, so the whole stage sits above the fixed canvas; it has no background, so the 3D shows through. */}
      <div
        className="sticky top-0 z-[15] h-svh select-none overflow-hidden"
        style={{ touchAction: "pan-y" }}
        // The hero jar can be spun by dragging (mouse) and opened with a click or tap.
        onPointerDown={(e) => {
          if (story.p >= HANDLE_UNTIL || (e.target as HTMLElement).closest("a, button")) return;
          const h = story.hand;
          h.pressed = true;
          h.moved = 0;
          h.lastX = e.clientX;
          // A finger has no hover, so whether it landed on the jar is only
          // known a frame later; taps are checked on release instead.
          if (e.pointerType === "mouse" && story.overJar) {
            h.dragging = true;
            e.currentTarget.setPointerCapture(e.pointerId);
          }
        }}
        onPointerMove={(e) => {
          const h = story.hand;
          e.currentTarget.style.cursor = story.p < HANDLE_UNTIL && story.overJar ? (h.dragging ? "grabbing" : "grab") : "";
          if (!h.pressed) return;
          const dx = e.clientX - h.lastX;
          h.moved += Math.abs(dx);
          h.lastX = e.clientX;
          if (h.dragging) h.velocity = dx * 0.012;
        }}
        onPointerUp={() => {
          const h = story.hand;
          if (h.pressed && h.moved < 6 && story.overJar) h.openedAt = performance.now();
          h.pressed = false;
          h.dragging = false;
        }}
      >
        <View className="absolute inset-0">
          <StudioLights />
          <Suspense fallback={null}>
            <StoryScene />
          </Suspense>
        </View>

        <div className="pointer-events-none absolute inset-0">
          {/* 0 · Hero */}
          <div data-ch="hero" className="absolute inset-x-0 top-0 frame pt-24 md:inset-y-0 md:flex md:items-center md:pt-0">
            <div data-block className="flex max-w-xl flex-col gap-5 md:gap-6">
              <p className="text-base italic text-muted md:text-lg">Personal supplements, made to keep</p>
              <h1 className="font-display text-5xl leading-[0.95] md:text-7xl xl:text-8xl">
                One jar for life,
                <br />
                <em>refills by the month.</em>
              </h1>
              <p className="max-w-md text-lg leading-relaxed md:text-xl">
                Your formula, printed on a frosted glass jar you keep. Each month a metal refill arrives to top it up.
              </p>
              <div className="pointer-events-auto flex flex-wrap gap-3">
                <Link href="/build" data-magnetic className="inline-flex h-12 items-center rounded-full bg-graphite px-7 text-lg text-white hover:bg-black md:h-14 md:px-8">
                  Design yours
                </Link>
                <a href="#range" data-magnetic className="inline-flex h-12 items-center rounded-full border border-graphite px-7 text-lg hover:bg-white md:h-14 md:px-8">
                  See the range
                </a>
              </div>
            </div>
          </div>
          <p data-cue className="absolute inset-x-0 bottom-6 text-center text-base italic text-muted">
            Scroll to open the jar
          </p>

          {/* 1 · Anatomy */}
          <div data-ch="anatomy" className="invisible absolute inset-0">
            <div data-block className="frame pt-24 md:absolute md:inset-x-0 md:bottom-10 md:pt-0">
              <p className="text-base italic text-muted md:text-lg">Inside the jar</p>
              <h2 className="font-display text-4xl leading-none md:text-5xl xl:text-6xl">Made to stay on your shelf.</h2>
            </div>
            {callouts.map((c) => (
              <div
                key={c.id}
                ref={(el) => {
                  story.anchors[c.id] = el;
                }}
                className="absolute left-0 top-0 hidden md:block"
              >
                <div data-callout className={`absolute top-0 flex -translate-y-1/2 items-center gap-3 ${c.side === "right" ? "left-0" : "right-0 flex-row-reverse"}`}>
                  <span className="h-2 w-2 shrink-0 rounded-full bg-graphite" />
                  <span data-line className={`h-px w-16 shrink-0 bg-graphite lg:w-24 ${c.side === "right" ? "origin-left" : "origin-right"}`} />
                  <span className={`w-56 ${c.side === "left" ? "text-right" : ""}`}>
                    <span className="block text-lg leading-tight">{c.title}</span>
                    <span className="block text-base italic leading-snug text-muted">{c.body}</span>
                  </span>
                </div>
              </div>
            ))}
            <ul data-callout className="absolute inset-x-0 bottom-6 grid grid-cols-2 gap-x-4 gap-y-2 px-6 text-sm md:hidden">
              {callouts.map((c) => (
                <li key={c.id} className="rounded-full bg-white/80 px-3 py-1.5">
                  {c.title}
                </li>
              ))}
            </ul>
          </div>

          {/* 2 · Refill */}
          <div data-ch="refill" className="invisible absolute inset-x-0 top-0 frame pt-24 md:inset-y-0 md:flex md:items-center md:pt-0">
            <div data-block className="max-w-md">
              <p className="text-base italic text-muted md:text-lg">The monthly ritual</p>
              <h2 className="font-display text-4xl leading-none md:text-5xl xl:text-6xl">Refilled in ten seconds.</h2>
              <div className="mt-8 md:mt-12">
                <div className="flex items-baseline gap-3 text-lg text-muted">
                  <span>Step</span>
                  <span className="relative inline-block h-[1.2em] overflow-hidden font-display text-3xl leading-[1.2] text-graphite md:text-4xl">
                    <span data-count className="flex flex-col">
                      {steps.map((_, i) => (
                        <span key={i}>0{i + 1}</span>
                      ))}
                    </span>
                  </span>
                  <span>of 03</span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2" aria-hidden>
                  {steps.map((s) => (
                    <span key={s.title} className="h-1 overflow-hidden rounded-full bg-graphite/12">
                      <span data-fill className="block h-full origin-left scale-x-0 rounded-full bg-graphite" />
                    </span>
                  ))}
                </div>
                <ol className="relative mt-6 h-32 overflow-hidden md:h-36">
                  {steps.map((s, i) => (
                    <li key={s.title} data-step className={`absolute inset-0 ${i > 0 ? "opacity-0" : ""}`}>
                      <span className="block font-display text-3xl leading-tight md:text-4xl">{s.title}</span>
                      <span className="mt-2 block text-lg leading-relaxed text-muted">{s.body}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* 3 · A year */}
          <div data-ch="year" className="invisible absolute inset-x-0 top-0 frame pt-24 md:inset-y-0 md:flex md:items-center md:pt-0">
            <div data-block className="max-w-md">
              <p className="text-base italic text-muted md:text-lg">A year with Popsule</p>
              <h2 className="font-display text-4xl leading-none md:text-5xl xl:text-6xl">Twelve refills. One jar.</h2>
              <p className="mt-4 max-w-sm text-lg leading-relaxed">Change your formula, tone or size any month. The jar stays.</p>
              <dl className="mt-8 grid grid-cols-3 gap-6 md:mt-12 md:gap-10">
                {stats.map((s) => (
                  <div key={s.unit} data-stat>
                    <dt className="font-display text-5xl leading-none md:text-7xl">{s.value}</dt>
                    <dd className="mt-1 text-base">{s.unit}</dd>
                    <dd className="mt-1 hidden text-sm italic leading-snug text-muted md:block">{s.body}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* 4 · Range */}
          <div data-ch="range" className="invisible absolute inset-x-0 top-0 frame pt-24 md:inset-y-0 md:flex md:items-center md:pt-0">
            <div data-block className="max-w-md">
              <div className="flex items-baseline gap-3 text-base italic text-muted md:text-lg">
                <span>Four starting formulas</span>
                <span className="relative inline-block h-[1.3em] overflow-hidden not-italic text-graphite">
                  <span data-range-count className="flex flex-col leading-[1.3]">
                    {products.map((_, i) => (
                      <span key={i}>0{i + 1}</span>
                    ))}
                  </span>
                </span>
                <span>/ 04</span>
              </div>
              <div className="relative mt-4 h-56 md:h-72">
                {products.map((p, i) => (
                  <div key={p.id} data-product className={`absolute inset-0 ${i > 0 ? "invisible opacity-0" : ""}`}>
                    <h3 className="font-display text-5xl leading-none md:text-6xl">{p.name}</h3>
                    <p className="mt-3 text-xl">For {p.goal.toLowerCase()}</p>
                    <p className="mt-1 text-lg italic text-muted">{p.ingredients.join(" and ").toLowerCase()}</p>
                    <Link
                      href={`/build?d=${encodeSnapshot(startingSnapshot(p.id))}`}
                      data-magnetic
                      className="pointer-events-auto mt-6 inline-flex h-12 items-center whitespace-nowrap rounded-full bg-graphite px-7 text-lg text-white hover:bg-black"
                    >
                      Make {p.name} yours
                    </Link>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-3" aria-hidden>
                {products.map((p, i) => (
                  <span
                    key={p.id}
                    data-dot
                    className={`h-4 w-4 rounded-full ${i > 0 ? "scale-[0.55] opacity-45" : ""}`}
                    style={{ background: toneHex(p.tone) }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
