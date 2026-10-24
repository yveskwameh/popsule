"use client";

import { useSyncExternalStore } from "react";
import { useBag } from "@/store/bag";

// A shopping bag with the number of jars in it. Opens the bag drawer.
export default function BagButton({ className = "" }: { className?: string }) {
  const count = useBag((s) => s.items.reduce((n, x) => n + x.qty, 0));
  // The bag lives in localStorage, so only show the count after hydration.
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const n = ready ? count : 0;

  return (
    <button
      type="button"
      aria-label={`Bag, ${n} ${n === 1 ? "item" : "items"}`}
      data-magnetic
      onClick={() => useBag.getState().setOpen(true)}
      className={`relative grid h-11 w-11 place-items-center rounded-full bg-mist text-graphite hover:bg-line ${className}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M5.5 8h13l-1 12.5h-11z" />
        <path d="M9 10.5V7a3 3 0 0 1 6 0v3.5" />
      </svg>
      {n > 0 && (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-graphite px-1 text-xs tabular-nums text-white">{n}</span>
      )}
    </button>
  );
}
