"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { encodeSnapshot } from "@/lib/lab";
import { arrival, deliveries, loadOrder, PRINT_DAYS } from "@/lib/order";
import { ClearBag, OrderJar } from "./OrderJar";

const noop = () => () => {};

// The confirmation, read back from the order saved at checkout.
export default function Receipt() {
  const number = useSearchParams().get("order") ?? "";
  // Orders live in this browser, so only look once we're in it.
  const order = useSyncExternalStore(
    noop,
    () => loadOrder(number),
    () => undefined,
  );

  if (order === undefined) return <div className="flex-1" />;

  if (!order) {
    return (
      <div className="m-auto flex flex-col items-center gap-4 pb-16 text-center">
        <h1 className="font-display text-5xl leading-none md:text-6xl">We couldn&apos;t find that order.</h1>
        <p className="max-w-md text-lg text-muted">It may have been placed in another browser. Your bag is still waiting.</p>
        <Link href="/build" className="mt-2 inline-flex h-12 items-center rounded-full bg-graphite px-7 text-lg text-white hover:bg-black">
          Back to your jar
        </Link>
      </div>
    );
  }

  const monthly = order.plan === "monthly";
  const steps = [
    { when: `In ${PRINT_DAYS} days`, what: "We blend your capsules and print your name on the glass." },
    { when: arrival(order.placedAt, order.delivery), what: `${deliveries.find((d) => d.id === order.delivery)!.title} delivery to your door.` },
    ...(monthly ? [{ when: "Every 30 days", what: "A new refill ships. We email a few days before, so you can change it." }] : []),
  ];

  return (
    <div className="grid grid-cols-1 gap-8 pb-6 md:min-h-0 md:flex-1 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:gap-10">
      <ClearBag />
      <div className="order-2 h-[46svh] overflow-hidden rounded-3xl bg-mist md:order-1 md:h-full">
        <OrderJar design={encodeSnapshot(order.lines[0].snapshot)} />
      </div>

      <div className="order-1 flex flex-col justify-center gap-7 md:order-2">
        <div>
          <p className="text-lg italic text-muted">Order {order.number} is confirmed</p>
          <h1 className="font-display text-5xl leading-none md:text-6xl">Thank you{order.name ? `, ${order.name}` : ""}.</h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed text-muted">
            Your {order.lines.length > 1 || order.lines[0].qty > 1 ? "jars are" : "jar is"} on the list for printing. Drag it, open it, it&apos;s yours.
          </p>
        </div>

        <div className="rounded-3xl bg-mist p-5">
          <ul className="flex flex-col gap-2">
            {order.lines.map((l, i) => (
              <li key={i} className="flex items-baseline justify-between gap-4 text-lg">
                <span className="min-w-0 truncate">
                  <span className={l.snapshot.label.font === "serif" ? "italic" : "font-display"}>{l.name}</span>
                  {l.qty > 1 && <span className="text-muted"> × {l.qty}</span>}
                  <span className="block truncate text-sm text-muted">{l.detail}</span>
                </span>
                <span className="shrink-0 tabular-nums">${l.price}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-base text-muted">
              Paid with {order.method}
              {order.shipping > 0 && ` · $${order.shipping} delivery`}
            </span>
            <span className="font-display text-4xl tabular-nums">${order.total}</span>
          </div>
          {monthly && <p className="text-right text-sm text-muted">then ${order.subtotal} each month</p>}
        </div>

        <ol className="flex flex-col gap-3">
          {steps.map((s) => (
            <li key={s.what} className="grid grid-cols-1 gap-0.5 text-lg sm:grid-cols-[9.5rem_1fr] sm:gap-4">
              <span className="text-muted">{s.when}</span>
              <span>{s.what}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
