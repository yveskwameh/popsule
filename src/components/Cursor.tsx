"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = "a[href], button:not(:disabled), summary, input, select, textarea, label, [role='radio'], [role='switch']";

// A soft ring that trails the pointer. It swells over anything you can press,
// and over a 3D stage it becomes a label ("Drag", "Open") saying what the jar
// does. Elements marked data-magnetic lean towards the pointer. Mouse and
// trackpad only; touch screens and reduced motion keep the plain cursor.
export default function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ring.current!;
    const text = label.current!;
    const target = { x: -100, y: -100 };
    const pos = { x: -100, y: -100 };
    let magnet: HTMLElement | null = null;
    let frame = 0;

    const release = () => {
      if (!magnet) return;
      magnet.style.transform = "";
      magnet = null;
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      target.x = e.clientX;
      target.y = e.clientY;
      el.dataset.visible = "true";

      const t = e.target instanceof Element ? e.target : null;
      const stage = t?.closest<HTMLElement>("[data-cursor]");
      const pressable = t?.closest(INTERACTIVE);
      const name = !pressable && stage?.dataset.cursor;
      el.dataset.mode = name ? "label" : pressable ? "press" : "idle";
      if (name) text.textContent = name;

      const m = t?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (m !== magnet) release();
      if (m) {
        magnet = m;
        const r = m.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        m.style.transition = "transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1), scale 0.2s, background-color 0.3s, color 0.3s";
        m.style.transform = `translate(${dx * 0.18}px, ${dy * 0.3}px)`;
      }
    };
    const onLeave = () => {
      el.dataset.visible = "false";
      release();
    };

    const loop = () => {
      pos.x += (target.x - pos.x) * 0.22;
      pos.y += (target.y - pos.y) * 0.22;
      el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      release();
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ring} aria-hidden data-visible="false" data-mode="idle" className="cursor-ring group pointer-events-none fixed left-0 top-0 z-[100]">
      <div className="cursor-ring-shape">
        <span ref={label} className="cursor-ring-label" />
      </div>
    </div>
  );
}
