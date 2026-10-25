"use client";

import { useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import { transitionTo } from "@/components/PageTransition";
import { ONCE_EXTRA, type Plan } from "@/lib/lab";
import { arrival, deliveries, methods, priceOrder, saveOrder, type Delivery, type Method } from "@/lib/order";
import { useBag, useBagReady } from "@/store/bag";
import Thumb from "@/components/bag/Thumb";

// Arrival dates count from when the page opened, read in the browser only.
let opened = 0;
const today = () => (opened ||= Date.now());
const noop = () => () => {};

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="flex items-baseline gap-3 text-xl">
        <span className="font-display text-base text-muted tabular-nums">0{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={on}
      onClick={onClick}
      className={`flex flex-col items-start gap-0.5 rounded-2xl px-4 py-3.5 text-left transition-colors duration-300 ${on ? "bg-graphite text-white" : "bg-mist hover:bg-line/70"}`}
    >
      {children}
    </button>
  );
}

const icons: Record<Method, ReactNode> = {
  Card: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3 10h18M7 15h3" strokeLinecap="round" />
    </svg>
  ),
  "Apple Pay": (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.4 12.6c0-2 1.6-2.9 1.7-3a3.7 3.7 0 0 0-2.9-1.6c-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7a3.9 3.9 0 0 0-3.3 2c-1.4 2.4-.4 6 1 8 .7 1 1.5 2 2.5 2s1.4-.6 2.6-.6 1.5.6 2.6.6 1.7-1 2.4-2a8 8 0 0 0 1-2.2 3.4 3.4 0 0 1-2-3.2ZM14.4 6.6a3.4 3.4 0 0 0 .8-2.5 3.5 3.5 0 0 0-2.3 1.2 3.2 3.2 0 0 0-.8 2.4 2.9 2.9 0 0 0 2.3-1.1Z" />
    </svg>
  ),
  PayPal: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden>
      <path d="M8 20H5l2.6-15h6c2.8 0 4.4 1.7 3.9 4.2-.5 2.8-2.6 4.3-5.4 4.3H9.4L8 20Z" />
      <path d="M10.5 17.5h2.3l.8-4" />
    </svg>
  ),
};

// Checkout on one page: how often, how fast, how to pay, then place the
// order. Nothing is charged and no card details are asked for; placing the
// order saves it in the browser and opens the confirmation.
export default function CheckoutClient() {
  const ready = useBagReady();
  const { items, plan, setPlan, setOpen } = useBag();
  const [delivery, setDelivery] = useState<Delivery>("standard");
  const [method, setMethod] = useState<Method>("Card");
  const [name, setName] = useState("");
  const [stage, setStage] = useState<"idle" | "paying" | "placing">("idle");
  const now = useSyncExternalStore(noop, today, () => 0);

  if (!ready) return <div className="flex-1" />;

  if (!items.length && stage === "idle") {
    return (
      <div className="m-auto flex flex-col items-center gap-5 pb-16 text-center">
        <h1 className="font-display text-5xl leading-none md:text-6xl">Your bag is empty.</h1>
        <p className="text-lg text-muted">Build a jar with your name on it, then come back here.</p>
        <Link href="/build" data-magnetic className="inline-flex h-12 items-center rounded-full bg-cta px-7 text-lg text-on-cta hover:bg-cta-hover">
          Build your jar
        </Link>
      </div>
    );
  }

  const { lines, subtotal, shipping, total } = priceOrder(items, plan, delivery);
  const count = items.reduce((n, x) => n + x.qty, 0);

  const place = async () => {
    setStage("paying");
    await new Promise((r) => setTimeout(r, 1100));
    setStage("placing");
    await new Promise((r) => setTimeout(r, 900));
    const order = saveOrder({ name: name.trim(), plan, delivery, method, lines, subtotal, shipping, total });
    // The confirmation page empties the bag once it's showing the order.
    transitionTo(`/checkout/success?order=${order.number}`);
  };

  const busy = stage !== "idle";

  return (
    <div className="grid grid-cols-1 gap-10 pb-10 md:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] md:gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
      <div className="flex flex-col gap-9">
        <div>
          <p className="text-lg italic text-muted">Checkout</p>
          <h1 className="font-display text-5xl leading-none md:text-6xl">Almost yours.</h1>
        </div>

        <Step n={1} title="How often">
          <div role="radiogroup" aria-label="How often" className="grid grid-cols-2 gap-2">
            {(["monthly", "once"] as Plan[]).map((p) => (
              <Choice key={p} on={plan === p} onClick={() => setPlan(p)}>
                <span className="text-lg">{p === "monthly" ? "Monthly refills" : "Just once"}</span>
                <span className={`text-sm ${plan === p ? "text-white/60" : "text-muted"}`}>
                  {p === "monthly" ? "Skip, pause or cancel any time" : `One jar and one refill, +$${ONCE_EXTRA} each`}
                </span>
              </Choice>
            ))}
          </div>
        </Step>

        <Step n={2} title="Delivery">
          <div role="radiogroup" aria-label="Delivery" className="grid grid-cols-2 gap-2">
            {deliveries.map((d) => (
              <Choice key={d.id} on={delivery === d.id} onClick={() => setDelivery(d.id)}>
                <span className="flex w-full items-baseline justify-between text-lg">
                  {d.title}
                  <span className="text-base">{d.price ? `$${d.price}` : "Free"}</span>
                </span>
                <span className={`text-sm ${delivery === d.id ? "text-white/60" : "text-muted"}`}>Arrives {arrival(now, d.id)}</span>
              </Choice>
            ))}
          </div>
        </Step>

        <Step n={3} title="Payment">
          <div role="radiogroup" aria-label="Payment" className="grid grid-cols-3 gap-2">
            {methods.map((m) => (
              <Choice key={m} on={method === m} onClick={() => setMethod(m)}>
                <span className="flex flex-col items-start gap-2 text-base">
                  {icons[m]}
                  {m}
                </span>
              </Choice>
            ))}
          </div>
          <p className="text-base text-muted">You&apos;ll confirm with {method === "Card" ? "your card" : method} when you place the order.</p>
        </Step>

        <Step n={4} title="Who's it for?">
          <label className="flex flex-col gap-2">
            <span className="text-base text-muted">First name, for the note in the box (optional)</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={24}
              autoComplete="given-name"
              className="h-12 rounded-full bg-mist px-5 text-lg outline-none focus:ring-2 focus:ring-graphite/30 md:max-w-sm"
            />
          </label>
        </Step>
      </div>

      <aside className="md:sticky md:top-6 md:self-start">
        <div className="flex flex-col gap-5 rounded-3xl bg-mist p-5 md:p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl">Your order ({count})</h2>
            <button type="button" onClick={() => setOpen(true)} disabled={busy} className="text-base text-muted underline-offset-4 hover:text-graphite hover:underline">
              Edit bag
            </button>
          </div>
          <ul className="flex flex-col gap-3">
            {lines.map((l, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="h-14 w-14 shrink-0 rounded-xl bg-white p-1">
                  <Thumb s={l.snapshot} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-lg leading-tight ${l.snapshot.label.font === "serif" ? "italic" : "font-display"}`}>
                    {l.name}
                    {l.qty > 1 && <span className="font-sans text-base font-normal text-muted"> × {l.qty}</span>}
                  </p>
                  <p className="truncate text-sm text-muted">{l.detail}</p>
                </div>
                <span className="shrink-0 text-lg tabular-nums">${l.price}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-1.5 text-base">
            <p className="flex justify-between">
              <span className="text-muted">{plan === "monthly" ? "Refills, each month" : "Subtotal"}</span>
              <span className="tabular-nums">${subtotal}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted">Delivery</span>
              <span className="tabular-nums">{shipping ? `$${shipping}` : "Free"}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted">Glass jar</span>
              <span>Included</span>
            </p>
            <p className="mt-2 flex items-baseline justify-between">
              <span className="text-lg">Today</span>
              <span className="font-display text-5xl tabular-nums">${total}</span>
            </p>
            {plan === "monthly" && <p className="text-right text-sm text-muted">then ${subtotal} each month</p>}
          </div>

          <button
            type="button"
            onClick={place}
            disabled={busy}
            data-magnetic
            className="relative inline-flex h-14 items-center justify-center overflow-hidden rounded-full bg-cta text-lg text-on-cta hover:bg-cta-hover disabled:cursor-progress"
          >
            {/* Fills while the order goes through. */}
            <span
              className={`absolute inset-y-0 left-0 bg-white/15 transition-[width] ease-out ${stage === "idle" ? "w-0 duration-0" : stage === "paying" ? "w-3/5 duration-[1100ms]" : "w-full duration-[900ms]"}`}
              aria-hidden
            />
            <span className="relative" aria-live="polite">
              {stage === "idle" ? `Place order · $${total}` : stage === "paying" ? `Confirming with ${method === "Card" ? "your card" : method}…` : "Placing your order…"}
            </span>
          </button>
          <p className="-mt-2 text-center text-sm text-muted">Free returns on the jar within 30 days.</p>
        </div>
      </aside>
    </div>
  );
}
