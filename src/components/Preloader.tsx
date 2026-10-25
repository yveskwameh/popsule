"use client";

import { useEffect, useState } from "react";
import { modelUrl } from "@/lib/site";
import { PRELOADED_KEY } from "@/lib/preload-script";
import CapsuleMark from "./ui/CapsuleMark";

const MIN = 1400; // ms the count takes at the least, so it reads as a moment, not a flicker
const MAX = 6000; // ms before it lets go regardless

// The first-visit loader: the capsule fills as the fonts, the page, the 3D
// model and the hero picture arrive, then the panel lifts off the hero.
export default function Preloader() {
  const [state, setState] = useState<"loading" | "leaving" | "gone">("loading");
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const html = document.documentElement;
    // Already shown this visit: the CSS keeps it hidden.
    if (html.hasAttribute("data-preloaded")) return;

    // What has to arrive. Each one moves the target a step.
    const heroPicture = () => {
      const el = document.querySelector<HTMLElement>(".hero-poster > div");
      const url = el && getComputedStyle(el).backgroundImage.match(/url\("?(.+?)"?\)/)?.[1];
      if (!url) return Promise.resolve();
      const img = new Image();
      img.src = url;
      return img.decode().catch(() => {});
    };
    const tasks = [
      document.fonts.ready,
      document.readyState === "complete" ? Promise.resolve() : new Promise((r) => window.addEventListener("load", r, { once: true })),
      fetch(modelUrl).then((r) => r.arrayBuffer()).catch(() => {}),
      heroPicture(),
    ];
    let done = 0;
    tasks.forEach((t) => Promise.resolve(t).then(() => done++));

    const start = performance.now();
    const quick = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let value = 0;
    let frame = 0;
    const tick = () => {
      const t = performance.now() - start;
      const target = t > MAX ? 100 : (done / tasks.length) * 100;
      // Ease towards what has loaded, but never faster than the minimum time.
      value += (target - value) * 0.09;
      const shownNow = Math.min(value + 0.6, quick ? 100 : (t / MIN) * 100, 100);
      setShown(shownNow);
      if (shownNow >= 100) {
        try {
          sessionStorage.setItem(PRELOADED_KEY, "1");
        } catch {}
        // The hero intro starts as the panel lifts, so the two overlap.
        html.removeAttribute("data-preload");
        setState("leaving");
        setTimeout(() => setState("gone"), 1100);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  if (state === "gone") return null;
  const n = Math.floor(shown);

  return (
    <div className={`preloader ${state === "leaving" ? "is-leaving" : ""}`} role="status" aria-label="Loading Popsule">
      <span className="frame absolute inset-x-0 top-0 py-4 font-display text-3xl leading-[2.75rem]">Popsule</span>
      <CapsuleMark fill={shown / 100} className="preloader-mark h-28 w-28 md:h-36 md:w-36" />
      <div className="frame absolute inset-x-0 bottom-0 flex items-end justify-between pb-6 md:pb-10">
        <p className="text-base italic text-muted md:text-lg">Getting your jar ready</p>
        <span className="font-display text-7xl leading-none tabular-nums md:text-9xl">
          {n}
          <span className="text-muted">%</span>
        </span>
      </div>
    </div>
  );
}
