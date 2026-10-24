"use client";

import { describe, planPrice, type LabSnapshot, type Plan } from "./lab";

// Orders are placed in the browser: no payment is taken and nothing is sent
// anywhere. The last few are kept so the confirmation page survives a reload.

export const deliveries = [
  { id: "standard", title: "Standard", days: [3, 5], price: 0 },
  { id: "express", title: "Express", days: [1, 2], price: 6 },
] as const;
export type Delivery = (typeof deliveries)[number]["id"];

export const methods = ["Card", "Apple Pay", "PayPal"] as const;
export type Method = (typeof methods)[number];

export type OrderLine = { name: string; detail: string; qty: number; price: number; snapshot: LabSnapshot };
export type Order = {
  number: string;
  placedAt: number;
  name: string;
  plan: Plan;
  delivery: Delivery;
  method: Method;
  lines: OrderLine[];
  subtotal: number;
  shipping: number;
  total: number;
};

const KEY = "popsule-orders";

export function priceOrder(items: { name: string; snapshot: LabSnapshot; qty: number }[], plan: Plan, delivery: Delivery) {
  const lines: OrderLine[] = items.map((x) => ({
    name: x.snapshot.label.text.trim() || x.name,
    detail: describe(x.snapshot),
    qty: x.qty,
    price: planPrice(x.snapshot, plan) * x.qty,
    snapshot: x.snapshot,
  }));
  const subtotal = lines.reduce((n, l) => n + l.price, 0);
  const shipping = deliveries.find((d) => d.id === delivery)!.price;
  return { lines, subtotal, shipping, total: subtotal + shipping };
}

// Every jar is printed to order before it ships.
export const PRINT_DAYS = 2;

// The days an order lands, as "Thu 29 Oct", counting from when it was placed.
export function arrival(placedAt: number, delivery: Delivery) {
  const [a, b] = deliveries.find((d) => d.id === delivery)!.days.map((n) => n + PRINT_DAYS);
  const fmt = (n: number) => new Date(placedAt + n * 86_400_000).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  return a === b ? fmt(a) : `${fmt(a)} – ${fmt(b)}`;
}

export function saveOrder(order: Omit<Order, "number" | "placedAt">) {
  const full: Order = { ...order, number: `PS-${Math.floor(100000 + Math.random() * 900000)}`, placedAt: Date.now() };
  try {
    const all: Order[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    localStorage.setItem(KEY, JSON.stringify([full, ...all].slice(0, 5)));
  } catch {
    // Storage blocked: the confirmation still shows from memory this once.
  }
  lastOrder = full;
  return full;
}

let lastOrder: Order | null = null;
const found = new Map<string, Order | null>();

// Returns the same object on every call, so React can read it as a store.
export function loadOrder(number: string): Order | null {
  if (lastOrder?.number === number) return lastOrder;
  if (!found.has(number)) {
    try {
      const all: Order[] = JSON.parse(localStorage.getItem(KEY) || "[]");
      found.set(number, all.find((o) => o.number === number) ?? null);
    } catch {
      found.set(number, null);
    }
  }
  return found.get(number)!;
}
