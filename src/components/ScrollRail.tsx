"use client";

import { useEffect, useRef } from "react";

// The page's scrollbar, on the left: a slim graphite handle on a faint rail.
// It shows while you scroll or hover near the edge, then fades away. Drag the
// handle or click the rail to jump. Hidden on pages that don't scroll.
export default function ScrollRail() {
  const rail = useRef<HTMLDivElement>(null);
  const thumb = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const r = rail.current!;
    const t = thumb.current!;
    let idle: ReturnType<typeof setTimeout>;
    let drag: { y: number; scroll: number } | null = null;
    let frame = 0;

    const metrics = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const track = r.clientHeight;
      const size = Math.max(48, (window.innerHeight / document.documentElement.scrollHeight) * track);
      return { max, track, size };
    };

    const draw = () => {
      frame = 0;
      const { max, track, size } = metrics();
      r.dataset.off = max < 4 ? "true" : "false";
      t.style.height = `${size}px`;
      t.style.transform = `translateY(${max > 0 ? (window.scrollY / max) * (track - size) : 0}px)`;
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const wake = () => {
      r.dataset.awake = "true";
      clearTimeout(idle);
      idle = setTimeout(() => {
        if (!drag) r.dataset.awake = "false";
      }, 1200);
    };

    const onScroll = () => {
      queue();
      wake();
    };
    // Waking near the left edge, so the rail is there when you reach for it.
    const onMove = (e: PointerEvent) => {
      if (e.clientX < 28) wake();
      if (!drag) return;
      const { max, track, size } = metrics();
      window.scrollTo({ top: drag.scroll + ((e.clientY - drag.y) / (track - size)) * max });
    };
    const onUp = () => {
      drag = null;
      r.dataset.dragging = "false";
      wake();
    };
    const onDown = (e: PointerEvent) => {
      e.preventDefault();
      let scroll = window.scrollY;
      if (e.target !== t) {
        // Click on the rail: jump so the handle centres there, then keep dragging.
        const { max, track, size } = metrics();
        const y = e.clientY - r.getBoundingClientRect().top - size / 2;
        scroll = Math.min(max, Math.max(0, (y / (track - size)) * max));
        window.scrollTo({ top: scroll });
      }
      drag = { y: e.clientY, scroll };
      r.dataset.dragging = "true";
    };

    const ro = new ResizeObserver(queue);
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", queue);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    r.addEventListener("pointerdown", onDown);
    draw();
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(idle);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", queue);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      r.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <div ref={rail} aria-hidden data-off="true" data-awake="false" data-dragging="false" className="scroll-rail">
      <div ref={thumb} className="scroll-rail-thumb" />
    </div>
  );
}
