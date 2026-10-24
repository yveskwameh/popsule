"use client";

import { create } from "zustand";
import type { ProductId, ToneId } from "@/lib/brand";
import {
  MAX_GOALS,
  startingSnapshot,
  surpriseSnapshot,
  type Glass,
  type LabSnapshot,
  type Metal,
  type Size,
} from "@/lib/lab";

type LabState = LabSnapshot & {
  past: LabSnapshot[];
  future: LabSnapshot[];

  checkpoint: () => void; // call once at the start of a continuous edit (typing)
  load: (s: LabSnapshot) => void;
  undo: () => void;
  redo: () => void;
  surprise: () => void;

  toggleGoal: (id: ProductId) => void;
  setSize: (size: Size) => void;
  setLid: (tone: ToneId) => void;
  setRefill: (tone: ToneId) => void;
  setMatchRefill: (on: boolean) => void;
  setGlass: (glass: Glass) => void;
  setMetal: (metal: Metal) => void;
  setLabel: (patch: Partial<LabSnapshot["label"]>, record?: boolean) => void;
};

const HISTORY = 60;

const snapshot = (s: LabState): LabSnapshot => ({
  goals: s.goals,
  size: s.size,
  lid: s.lid,
  refill: s.refill,
  matchRefill: s.matchRefill,
  glass: s.glass,
  metal: s.metal,
  label: s.label,
});

export const useLab = create<LabState>()((set, get) => {
  // Saves the current state for undo, then applies the change.
  const record = (patch: Partial<LabState>) =>
    set((s) => ({ past: [...s.past, snapshot(s)].slice(-HISTORY), future: [], ...patch }));

  return {
    ...startingSnapshot(),
    past: [],
    future: [],

    checkpoint: () => record({}),
    load: (s) => set({ ...s, past: [], future: [] }),
    undo: () =>
      set((s) => {
        const prev = s.past.at(-1);
        if (!prev) return s;
        return { ...prev, past: s.past.slice(0, -1), future: [snapshot(s), ...s.future] };
      }),
    redo: () =>
      set((s) => {
        const next = s.future[0];
        if (!next) return s;
        return { ...next, past: [...s.past, snapshot(s)], future: s.future.slice(1) };
      }),
    surprise: () => record(surpriseSnapshot(snapshot(get()))),

    toggleGoal: (id) => {
      const { goals } = get();
      const on = goals.includes(id);
      if (on && goals.length === 1) return; // a formula needs at least one goal
      if (!on && goals.length >= MAX_GOALS) return;
      record({ goals: on ? goals.filter((g) => g !== id) : [...goals, id] });
    },
    setSize: (size) => record({ size }),
    setLid: (lid) => record(get().matchRefill ? { lid, refill: lid } : { lid }),
    setRefill: (refill) => record({ refill, matchRefill: false }),
    setMatchRefill: (on) => record(on ? { matchRefill: true, refill: get().lid } : { matchRefill: false }),
    setGlass: (glass) => record({ glass }),
    setMetal: (metal) => record({ metal }),
    setLabel: (patch, rec = true) => {
      const label = { ...get().label, ...patch };
      if (rec) record({ label });
      else set({ label });
    },
  };
});

export const currentSnapshot = () => snapshot(useLab.getState());
