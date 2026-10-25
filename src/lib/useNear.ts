"use client";

import { useEffect, useState, type RefObject } from "react";

// True while an element is within about a screen of the viewport. Sections
// mount their 3D only then, so the browser only builds what the visitor is
// looking at or about to reach, and frees it again once they're well past.
export function useNear(ref: RefObject<HTMLElement | null>) {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Mount a screen ahead; unmount only when three screens away, so a quick
    // scroll back doesn't rebuild it.
    const enter = new IntersectionObserver(([e]) => e.isIntersecting && setNear(true), { rootMargin: "100% 0px" });
    const leave = new IntersectionObserver(([e]) => !e.isIntersecting && setNear(false), { rootMargin: "300% 0px" });
    enter.observe(el);
    leave.observe(el);
    return () => {
      enter.disconnect();
      leave.disconnect();
    };
  }, [ref]);
  return near;
}
