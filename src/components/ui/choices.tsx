"use client";

import type { ReactNode } from "react";
import { tones, type ToneId } from "@/lib/brand";

// The small pickers shared by "Make it yours" and Build your jar.

export function Tones({
  value,
  onChange,
  label,
  options = tones.filter((t) => t.id !== "chalk"),
}: {
  value: ToneId;
  onChange: (t: ToneId) => void;
  label: string;
  options?: readonly (typeof tones)[number][];
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1.5">
      {options.map((t) => (
        <button
          key={t.id}
          type="button"
          role="radio"
          aria-checked={value === t.id}
          aria-label={t.name}
          title={t.name}
          onClick={() => onChange(t.id)}
          className={`h-8 w-8 rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.08)] ring-offset-2 ring-offset-white transition-shadow ${value === t.id ? "ring-2 ring-graphite" : "hover:ring-1 hover:ring-graphite/40"}`}
          style={{ background: t.hex }}
        />
      ))}
    </div>
  );
}

export function Pair<T extends string>({
  value,
  options,
  onChange,
  render,
  className = "",
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
  render: (v: T) => ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex rounded-full bg-mist p-1 ${className}`}>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          aria-pressed={value === o}
          onClick={() => onChange(o)}
          className={`flex-1 whitespace-nowrap rounded-full px-4 py-1.5 text-base transition-colors duration-300 ${value === o ? "bg-graphite text-white" : "text-graphite/70 hover:text-graphite"}`}
        >
          {render(o)}
        </button>
      ))}
    </div>
  );
}
