"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { lenis } from "./SmoothScroll";
import CapsuleMark from "./ui/CapsuleMark";

// Moving between pages: a graphite curtain rises over the page, the next page
// loads behind it, then the curtain carries on up and off. Internal links are
// caught here, so every <Link> and <a> gets it without changes.
const COVER = 600; // ms for the curtain to rise over the page
const LIFT = 750; // ms for it to leave
// ms from the start before it may lift, so the capsule can fill, turn and
// settle (globals.css) even when the next page is ready at once.
const HOLD = 1450;

type Phase = "idle" | "cover" | "reveal";

// For navigations started in code (the checkout, once an order is placed).
export let transitionTo: (href: string) => void = () => {};

export default function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const pending = useRef<string | null>(null);
  const started = useRef(0);

  useEffect(() => {
    const go = (href: string) => {
      if (pending.current) return;
      pending.current = href;
      started.current = performance.now();
      setPhase("cover");
      // Holds the next page's intro until the curtain lifts (globals.css).
      document.documentElement.setAttribute("data-curtain", "");
      setTimeout(() => router.push(href), COVER);
      // If the page never arrives, don't leave the visitor behind a curtain.
      setTimeout(() => {
        if (pending.current !== href) return;
        pending.current = null;
        document.documentElement.removeAttribute("data-curtain");
        setPhase("idle");
      }, COVER + 5000);
    };
    transitionTo = go;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element).closest("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      // Other sites, anchors on this page and same-page changes keep their own behaviour.
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      e.preventDefault();
      go(url.pathname + url.search + url.hash);
    };
    // Capture phase, so it runs before <Link> and stops its instant navigation.
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  // The new page has rendered behind the curtain: start at its top and lift.
  useEffect(() => {
    if (!pending.current) return;
    pending.current = null;
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    const frame = requestAnimationFrame(() => {
      if (!location.hash) lenis?.scrollTo(0, { immediate: true, force: true });
      const wait = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : started.current + HOLD - performance.now();
      t1 = setTimeout(() => {
        setPhase("reveal");
        const html = document.documentElement;
        html.removeAttribute("data-curtain");
        // The new page rises a little as the curtain lifts off it.
        html.setAttribute("data-entering", "");
        t2 = setTimeout(() => {
          setPhase("idle");
          html.removeAttribute("data-entering");
        }, LIFT + 150);
      }, Math.max(150, wait));
    });
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [pathname]);

  return (
    <div aria-hidden data-phase={phase} className="curtain">
      <span className="curtain-pop relative grid place-items-center">
        <span className="curtain-ring" />
        <CapsuleMark className="curtain-mark h-20 w-20 text-white md:h-24 md:w-24" />
      </span>
      <span className="curtain-word font-display text-3xl text-white">Popsule</span>
    </div>
  );
}
