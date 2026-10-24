"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { decodeSnapshot, encodeSnapshot, MAX_QTY, type LabSnapshot, type Plan } from "@/lib/lab";

// The bag: designs from Build your jar, how many of each, and whether they
// come back every month. Lives in localStorage; the drawer is BagDrawer.
export type BagItem = {
  id: string;
  name: string;
  snapshot: LabSnapshot;
  qty: number;
};

type BagState = {
  items: BagItem[];
  plan: Plan;
  open: boolean;
  add: (item: Omit<BagItem, "qty">) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  setPlan: (plan: Plan) => void;
  setOpen: (open: boolean) => void;
};

export const useBag = create<BagState>()(
  persist(
    (set) => ({
      items: [],
      plan: "monthly",
      open: false,
      // The same design twice is one line with two jars.
      add: (item) =>
        set((s) => {
          const code = encodeSnapshot(item.snapshot);
          const same = s.items.find((x) => encodeSnapshot(x.snapshot) === code);
          if (same) return { items: s.items.map((x) => (x === same ? { ...x, qty: Math.min(MAX_QTY, x.qty + 1) } : x)) };
          return { items: [...s.items, { ...item, qty: 1 }] };
        }),
      setQty: (id, qty) => set((s) => ({ items: s.items.map((x) => (x.id === id ? { ...x, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : x)) })),
      remove: (id) => set((s) => ({ items: s.items.filter((x) => x.id !== id) })),
      clear: () => set({ items: [] }),
      setPlan: (plan) => set({ plan }),
      setOpen: (open) => set({ open }),
    }),
    {
      name: "popsule-bag",
      // Read after hydration (BagDrawer), so the server and first client render agree.
      skipHydration: true,
      version: 1,
      partialize: (s) => ({ items: s.items, plan: s.plan }),
      // Version 0 had no quantities; anything that no longer decodes is dropped.
      migrate: (old) => {
        const o = (old ?? {}) as { items?: { id: string; name: string; snapshot: LabSnapshot; qty?: number }[]; plan?: Plan };
        const items = (o.items ?? []).flatMap((x) => {
          const snapshot = decodeSnapshot(encodeSnapshot(x.snapshot));
          return snapshot ? [{ id: x.id, name: x.name, snapshot, qty: x.qty ?? 1 }] : [];
        });
        return { items, plan: o.plan === "once" ? "once" : "monthly" };
      },
    },
  ),
);

// True once the saved bag has been read, so pages don't flash "empty" first.
export function useBagReady() {
  return useSyncExternalStore(
    (cb) => useBag.persist.onFinishHydration(cb),
    () => useBag.persist.hasHydrated(),
    () => false,
  );
}
