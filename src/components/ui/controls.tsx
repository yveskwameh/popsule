"use client";

import type { ButtonHTMLAttributes } from "react";

// A round, quiet icon button: white with a hairline, for tools on a stage.

const press = "transition-colors active:scale-[0.98] disabled:opacity-35 disabled:pointer-events-none";

export function IconButton({
  label,
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line bg-white text-graphite hover:bg-mist ${press} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
