// Single source of truth for brand values shared by CSS-land and the 3D scene.
// Keep in sync with the @theme tokens in app/globals.css.

// The site itself only ever uses these. Earth tones belong to the products.
export const palette = {
  white: "#FFFFFF",
  mist: "#F4F3F0",
  graphite: "#2A2C30",
  muted: "#6B6D72",
  line: "#DDDCD8",
  steel: "#C9CCD1",
} as const;

export const tones = [
  { id: "sage", name: "Sage", hex: "#8E9A86" },
  { id: "clay", name: "Clay", hex: "#B98B6E" },
  { id: "sand", name: "Sand", hex: "#CBBFA6" },
  { id: "slate", name: "Slate", hex: "#6E7781" },
  { id: "chalk", name: "Chalk", hex: "#F2F1EE" },
  { id: "graphite", name: "Graphite", hex: "#2A2C30" },
] as const;

export type ToneId = (typeof tones)[number]["id"];

export const toneHex = (id: ToneId) => tones.find((t) => t.id === id)!.hex;

export type ProductId = "pillow-talk" | "head-space" | "glow-up" | "gut-feeling";

export type Product = {
  id: ProductId;
  name: string;
  goal: string;
  // Placeholder pairings, not a formula decision.
  ingredients: [string, string];
  tone: ToneId;
};

export const products: Product[] = [
  { id: "pillow-talk", name: "Pillow Talk", goal: "Sleep", ingredients: ["Magnesium", "Chamomile"], tone: "sage" },
  { id: "head-space", name: "Head Space", goal: "Focus", ingredients: ["L-theanine", "B12"], tone: "clay" },
  { id: "glow-up", name: "Glow Up", goal: "Skin", ingredients: ["Collagen", "Vitamin C"], tone: "sand" },
  { id: "gut-feeling", name: "Gut Feeling", goal: "Gut", ingredients: ["Probiotics", "Ginger"], tone: "slate" },
];

export const productById = (id: ProductId) => products.find((p) => p.id === id)!;
