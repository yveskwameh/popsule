"use client";

import type { CSSProperties } from "react";
import { setTheme, useTheme } from "@/lib/theme";

// Sun and moon in one round button. The sun sets as the moon rises.
export default function ThemeToggle({ className = "", style }: { className?: string; style?: CSSProperties }) {
  const dark = useTheme() === "dark";
  return (
    <button
      type="button"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={dark}
      data-magnetic
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={`relative grid h-11 w-11 place-items-center overflow-hidden rounded-full text-graphite hover:bg-line ${className}`}
      style={style}
    >
      <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        aria-hidden
        className={`absolute transition-[translate,rotate,opacity] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${dark ? "translate-y-6 rotate-90 opacity-0" : ""}`}
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
      </svg>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        aria-hidden
        className={`absolute transition-[translate,rotate,opacity] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${dark ? "" : "-translate-y-6 -rotate-45 opacity-0"}`}
      >
        <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
      </svg>
    </button>
  );
}
