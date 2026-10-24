"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { lenis } from "./SmoothScroll";

// The page's scrollbar: a short column centred on the left edge, with a tick
// for every section (anything marked data-section). A graphite handle slides
// between the ticks as you read, and a tag beside it names the section, but
// only while you scroll or hover, so it never sits on text you're reading.
// Click a tick to glide there, or drag along the column to scrub. Pages
// without named sections get the same column as a plain progress bar.

type Section = { label: string; at: number }; // at: the scroll position where it starts

const STEP = 16; // px between ticks
const PLAIN = 8; // ticks drawn on pages without named sections
const pad = (n: number) => String(n).padStart(2, "0");

function glide(top: number) {
  if (lenis) lenis.scrollTo(top, { duration: 1.2 });
  else window.scrollTo({ top, behavior: "smooth" });
}

export default function ScrollRail() {
  const [sections, setSections] = useState<Section[]>([]);
  const [scrollable, setScrollable] = useState(false);
  const [active, setActive] = useState(0);
  const [awake, setAwake] = useState(false);
  const handle = useRef<HTMLDivElement>(null);
  const live = useRef({ sections: [] as Section[], active: 0, max: 1, dragging: false });

  // Where each section starts, in scroll positions. Re-read when the page resizes.
  const measure = useCallback(() => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const lead = window.innerHeight * 0.3;
    const found = [...document.querySelectorAll<HTMLElement>("[data-section]")]
      .map((el) => ({ label: el.dataset.section!, at: Math.round(Math.min(max, Math.max(0, el.getBoundingClientRect().top + window.scrollY - lead))) }))
      .sort((a, b) => a.at - b.at)
      .filter((s, i, all) => i === 0 || s.at - all[i - 1].at > 4);
    // No named sections: evenly spaced stops make it a plain progress bar.
    const stops = found.length >= 2 ? found : Array.from({ length: PLAIN }, (_, i) => ({ label: "", at: Math.round((i / (PLAIN - 1)) * max) }));
    live.current.sections = stops;
    live.current.max = max;
    setSections(stops);
    setScrollable(max > 4);
  }, []);

  useEffect(() => {
    let idle: ReturnType<typeof setTimeout>;
    let frame = 0;
    const start = requestAnimationFrame(measure);

    // The handle sits between two ticks in proportion to how far you are
    // through that section.
    const draw = () => {
      frame = 0;
      const { sections: secs, max } = live.current;
      if (!secs.length) return;
      const y = window.scrollY;
      let i = 0;
      while (i + 1 < secs.length && secs[i + 1].at <= y + 2) i++;
      if (i !== live.current.active) {
        live.current.active = i;
        setActive(i);
      }
      const from = secs[i].at;
      const to = secs[i + 1]?.at ?? max;
      const within = to > from ? Math.min(1, Math.max(0, (y - from) / (to - from))) : 0;
      if (handle.current) handle.current.style.transform = `translateY(${(i + (i + 1 < secs.length ? within : 0)) * STEP}px)`;
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const wake = () => {
      setAwake(true);
      clearTimeout(idle);
      idle = setTimeout(() => !live.current.dragging && setAwake(false), 1400);
    };
    const onScroll = () => {
      queue();
      wake();
    };
    const ro = new ResizeObserver(() => {
      measure();
      queue();
    });
    ro.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    queue();
    return () => {
      cancelAnimationFrame(start);
      cancelAnimationFrame(frame);
      clearTimeout(idle);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [measure]);

  // Dragging along the column scrubs: the pointer's place between two ticks
  // maps to the same place between those two sections.
  const scrubTo = (column: HTMLElement, clientY: number) => {
    const { sections: secs, max } = live.current;
    const f = Math.min(secs.length - 1, Math.max(0, (clientY - column.getBoundingClientRect().top - STEP / 2) / STEP));
    const i = Math.floor(f);
    const to = secs[i + 1]?.at ?? max;
    window.scrollTo({ top: secs[i].at + (f - i) * (to - secs[i].at) });
  };

  if (!scrollable || !sections.length) return null;
  const named = sections[0].label !== "";
  const show = awake ? "opacity-100" : "opacity-0";

  return (
    <nav aria-label="Sections" className="group fixed left-3 top-1/2 z-50 hidden -translate-y-1/2 md:block">
      {/* A soft panel behind the names while you hover, so they read over anything. */}
      {named && (
        <div className="pointer-events-none absolute -inset-y-4 -left-3 w-40 rounded-r-3xl bg-white/85 opacity-0 backdrop-blur-md transition-opacity duration-300 group-hover:opacity-100" />
      )}

      <div
        className="relative cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          live.current.dragging = true;
          scrubTo(e.currentTarget, e.clientY);
        }}
        onPointerMove={(e) => live.current.dragging && scrubTo(e.currentTarget, e.clientY)}
        onPointerUp={() => (live.current.dragging = false)}
      >
        {sections.map((s, i) => (
          <button
            key={s.at}
            type="button"
            tabIndex={named ? 0 : -1}
            aria-label={named ? s.label : undefined}
            aria-hidden={named ? undefined : true}
            aria-current={named && i === active ? "true" : undefined}
            onClick={() => glide(s.at)}
            className="relative flex w-6 items-center"
            style={{ height: STEP }}
          >
            <span className={`block h-0.5 rounded-full transition-all duration-300 ${i === active ? "w-3.5 bg-graphite/60" : "w-2.5 bg-graphite/40 group-hover:w-3"}`} />
            {named && (
              <span
                className={`absolute left-8 whitespace-nowrap text-xs opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${i === active ? "text-graphite" : "text-muted hover:text-graphite"}`}
              >
                {s.label}
              </span>
            )}
          </button>
        ))}

        {/* The handle, and the tag that rides with it while you scroll. */}
        <div ref={handle} className="pointer-events-none absolute left-0 top-0 flex items-center" style={{ height: STEP }}>
          <span className="block h-[3px] w-5 rounded-full bg-graphite" />
          {named && (
            <span
              className={`ml-3 flex items-center gap-1.5 whitespace-nowrap rounded-full bg-graphite py-0.5 pl-2 pr-2.5 text-xs text-white transition-opacity duration-300 group-hover:opacity-0 ${show}`}
            >
              <span className="tabular-nums text-white/55">{pad(active + 1)}</span>
              <span key={active} className="animate-[tag-in_0.35s_ease-out]">
                {sections[active].label}
              </span>
            </span>
          )}
        </div>
      </div>
    </nav>
  );
}
