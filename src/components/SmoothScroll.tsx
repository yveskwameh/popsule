"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

// The live instance, for anything that wants to glide to a position.
export let lenis: Lenis | null = null;

// Lenis is driven by GSAP's ticker so smooth scroll and ScrollTrigger
// share one clock and never drift apart.
export default function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({ autoRaf: false });
    lenis = instance;

    // Links to a section on this page (#range, #how) glide there at a pace you
    // can follow: about 2,600px a second, a little quicker than scrolling by
    // hand, so a long trip through the jar story reads as a scroll, not a cut.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
      const target = a && a.hash.length > 1 ? document.getElementById(decodeURIComponent(a.hash.slice(1))) : null;
      if (!target) return;
      e.preventDefault();
      const distance = Math.abs(target.getBoundingClientRect().top);
      instance.scrollTo(target, {
        duration: Math.min(5, Math.max(1.2, distance / 2600)),
        easing: (t) => 0.5 - Math.cos(Math.PI * t) / 2,
      });
      history.pushState(null, "", a!.hash);
    };
    document.addEventListener("click", onClick);
    instance.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      document.removeEventListener("click", onClick);
      gsap.ticker.remove(tick);
      instance.destroy();
      lenis = null;
    };
  }, []);

  return children;
}
