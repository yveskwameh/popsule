"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { describe, encodeSnapshot, MAX_QTY, ONCE_EXTRA, planPrice, type Plan } from "@/lib/lab";
import { useBag } from "@/store/bag";
import Thumb from "./Thumb";

const plans: { id: Plan; title: string; note: string }[] = [
  { id: "monthly", title: "Monthly refills", note: "Skip, pause or cancel any time" },
  { id: "once", title: "Just once", note: "One jar and one refill" },
];

export default function BagDrawer() {
  const { items, plan, open, setOpen, setQty, remove, setPlan } = useBag();
  const panel = useRef<HTMLDivElement>(null);

  const subtotal = items.reduce((sum, x) => sum + planPrice(x.snapshot, plan) * x.qty, 0);
  const count = items.reduce((n, x) => n + x.qty, 0);

  useEffect(() => {
    useBag.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!open) return;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  return (
    <div className={`fixed inset-0 z-[60] ${open ? "" : "pointer-events-none"}`} aria-hidden={!open} data-lenis-prevent>
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-graphite/25 backdrop-blur-[2px] transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label="Your bag"
        tabIndex={-1}
        inert={!open}
        className={`absolute inset-y-0 right-0 flex w-full flex-col bg-white outline-none transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] sm:inset-y-3 sm:right-3 sm:w-[27rem] sm:rounded-3xl ${open ? "translate-x-0" : "translate-x-[calc(100%+1rem)]"}`}
      >
        <header className="flex items-center justify-between px-6 pb-4 pt-5">
          <h2 className="font-display text-3xl">
            Your bag {count > 0 && <span className="text-muted">({count})</span>}
          </h2>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close bag" className="grid h-10 w-10 place-items-center rounded-full bg-mist hover:bg-line">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
            <div className="h-24 w-24 opacity-60">
              <Thumb s={{ goals: ["pillow-talk"], size: 60, lid: "sand", refill: "sand", matchRefill: true, glass: "frosted", metal: "satin", label: { text: "", font: "display" } }} />
            </div>
            <p className="text-xl">Your bag is empty.</p>
            <p className="-mt-3 text-base text-muted">Build a jar with your name on it, and it lands here.</p>
            <Link href="/build" onClick={() => setOpen(false)} data-magnetic className="inline-flex h-12 items-center rounded-full bg-cta px-7 text-lg text-on-cta hover:bg-cta-hover">
              Build your jar
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-4">
              {items.map((x) => (
                <li key={x.id} className="flex gap-4 rounded-2xl bg-mist p-3">
                  <div className="h-20 w-20 shrink-0 rounded-xl bg-white p-1.5">
                    <Thumb s={x.snapshot} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className={`truncate text-xl leading-tight ${x.snapshot.label.font === "serif" ? "italic" : "font-display"}`}>{x.snapshot.label.text || x.name}</p>
                      <p className="shrink-0 text-lg tabular-nums">${planPrice(x.snapshot, plan) * x.qty}</p>
                    </div>
                    <p className="mt-0.5 text-sm leading-snug text-muted">{describe(x.snapshot)}</p>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                      <div className="flex items-center rounded-full bg-white" role="group" aria-label="Quantity">
                        <button type="button" onClick={() => setQty(x.id, x.qty - 1)} disabled={x.qty <= 1} aria-label="One fewer" className="grid h-8 w-8 place-items-center rounded-full text-lg hover:bg-line disabled:opacity-30">
                          −
                        </button>
                        <span className="w-6 text-center text-base tabular-nums" aria-live="polite">
                          {x.qty}
                        </span>
                        <button type="button" onClick={() => setQty(x.id, x.qty + 1)} disabled={x.qty >= MAX_QTY} aria-label="One more" className="grid h-8 w-8 place-items-center rounded-full text-lg hover:bg-line disabled:opacity-30">
                          +
                        </button>
                      </div>
                      <div className="flex gap-3 text-sm">
                        <Link href={`/build?d=${encodeSnapshot(x.snapshot)}`} onClick={() => setOpen(false)} className="text-muted underline-offset-4 hover:text-graphite hover:underline">
                          Edit
                        </Link>
                        <button type="button" onClick={() => remove(x.id)} className="text-muted underline-offset-4 hover:text-graphite hover:underline">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-4 px-4 pb-4 pt-4">
              <div role="radiogroup" aria-label="How often" className="grid grid-cols-2 gap-2">
                {plans.map((p) => {
                  const on = plan === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      onClick={() => setPlan(p.id)}
                      className={`flex flex-col items-start gap-0.5 rounded-2xl px-4 py-3 text-left transition-colors duration-300 ${on ? "bg-graphite text-white" : "bg-mist hover:bg-line/70"}`}
                    >
                      <span className="flex w-full items-center justify-between text-base">
                        {p.title}
                        <span className={`grid h-4 w-4 place-items-center rounded-full border ${on ? "border-white" : "border-graphite/30"}`}>
                          {on && <span className="h-2 w-2 rounded-full bg-white" />}
                        </span>
                      </span>
                      <span className={`text-sm ${on ? "text-white/60" : "text-muted"}`}>{p.id === "once" ? `${p.note}, +$${ONCE_EXTRA} each` : p.note}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-1 px-1 text-base">
                <p className="flex justify-between">
                  <span className="text-muted">Shipping</span>
                  <span>Free</span>
                </p>
                <p className="flex items-baseline justify-between">
                  <span className="text-muted">{plan === "monthly" ? "Each month" : "Total"}</span>
                  <span className="font-display text-4xl tabular-nums">${subtotal}</span>
                </p>
              </div>

              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                data-magnetic
                className="inline-flex h-14 items-center justify-center rounded-full bg-cta text-lg text-on-cta hover:bg-cta-hover"
              >
                {plan === "monthly" ? "Start my refills" : "Checkout"}
              </Link>
              <p className="-mt-1 text-center text-sm text-muted">The glass jar ships free with your first refill.</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
