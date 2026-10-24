import { Color } from "three";
import { palette, productById, products, tones, type ProductId, type ToneId } from "./brand";

// Everything Build your jar edits: the formula, the shelf jar and its refill
// canister, the printed label, plus pricing and the share-link format.

export const sizes = [30, 60, 90] as const;
export type Size = (typeof sizes)[number];
export type Glass = "frosted" | "clear";
export type Metal = "satin" | "brushed";
export type LabelFont = "display" | "serif";

export type LabSnapshot = {
  goals: ProductId[];
  size: Size;
  lid: ToneId; // shelf jar lid
  refill: ToneId; // refill canister body; its lid is always graphite
  matchRefill: boolean; // refill follows the lid colour
  glass: Glass;
  metal: Metal;
  label: { text: string; font: LabelFont };
};

export const LABEL_MAX = 16;

export function newId() {
  return Math.random().toString(36).slice(2, 10);
}
export const MAX_GOALS = 3;

// Jar and canister heights scale with the capsule count.
export const sizeScale: Record<Size, number> = { 30: 0.8, 60: 1, 90: 1.2 };

export function startingSnapshot(id: ProductId = "pillow-talk"): LabSnapshot {
  const p = productById(id);
  return {
    goals: [id],
    size: 60,
    lid: p.tone,
    refill: p.tone,
    matchRefill: true,
    glass: "frosted",
    metal: "satin",
    label: { text: p.name, font: "display" },
  };
}

// Capsules inside the jar: white plus one tint per goal.
export function capsuleColors(goals: ProductId[]) {
  return ["#FFFFFF", "#E9E4DA", ...goals.map((g) => tones.find((t) => t.id === productById(g).tone)!.hex)];
}

export function inkFor(hex: string) {
  const hsl = { h: 0, s: 0, l: 0 };
  new Color(hex).getHSL(hsl);
  return hsl.l < 0.55 ? palette.white : palette.graphite;
}

// Prices per month.
const sizePrice: Record<Size, number> = { 30: 22, 60: 32, 90: 44 };
export function priceOf(s: Pick<LabSnapshot, "size" | "goals" | "metal">) {
  const base = sizePrice[s.size];
  const goals = Math.max(0, s.goals.length - 1) * 6;
  const finish = s.metal === "brushed" ? 2 : 0;
  return { base, goals, finish, total: base + goals + finish };
}

// Monthly refills are the point; a single jar and refill costs a little more.
export type Plan = "monthly" | "once";
export const ONCE_EXTRA = 8;
export const MAX_QTY = 9; // of one design, per order
export function planPrice(s: Pick<LabSnapshot, "size" | "goals" | "metal">, plan: Plan) {
  const { total } = priceOf(s);
  return plan === "monthly" ? total : total + ONCE_EXTRA;
}

// One line describing a design, for the bag, checkout and the receipt.
export function describe(s: LabSnapshot) {
  const tone = (id: ToneId) => tones.find((t) => t.id === id)!.name;
  return [
    s.goals.map((g) => productById(g).goal).join(" + "),
    `${s.size} capsules`,
    `${tone(s.lid)} lid`,
    `${s.glass === "frosted" ? "Frosted" : "Clear"} glass`,
  ].join(" · ");
}

const toneIds = tones.map((t) => t.id) as ToneId[];
const isTone = (v: unknown): v is ToneId => toneIds.includes(v as ToneId);

// Share links: compact JSON in base64url.
export function encodeSnapshot(s: LabSnapshot) {
  const json = JSON.stringify(s);
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeSnapshot(code: string): LabSnapshot | null {
  try {
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const raw = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))));
    const base = startingSnapshot();
    const goals = (Array.isArray(raw.goals) ? raw.goals : [])
      .filter((g: unknown): g is ProductId => products.some((p) => p.id === g))
      .slice(0, MAX_GOALS);
    return {
      goals: goals.length ? goals : base.goals,
      size: sizes.includes(raw.size) ? raw.size : base.size,
      lid: isTone(raw.lid) ? raw.lid : base.lid,
      refill: isTone(raw.refill) ? raw.refill : base.refill,
      matchRefill: typeof raw.matchRefill === "boolean" ? raw.matchRefill : true,
      glass: raw.glass === "clear" ? "clear" : "frosted",
      metal: raw.metal === "brushed" ? "brushed" : "satin",
      label: {
        text: typeof raw.label?.text === "string" ? raw.label.text.slice(0, LABEL_MAX) : base.label.text,
        font: raw.label?.font === "serif" ? "serif" : "display",
      },
    };
  } catch {
    return null;
  }
}

const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];

export function surpriseSnapshot(current: LabSnapshot): LabSnapshot {
  const goals = [...products]
    .sort(() => Math.random() - 0.5)
    .slice(0, 1 + Math.floor(Math.random() * MAX_GOALS))
    .map((p) => p.id);
  const lid = pick(toneIds);
  return {
    ...current,
    goals,
    size: pick(sizes),
    lid,
    refill: current.matchRefill ? lid : pick(toneIds),
    glass: pick(["frosted", "clear"] as const),
    metal: pick(["satin", "brushed"] as const),
    label: { ...current.label, font: pick(["display", "serif"] as const) },
  };
}
