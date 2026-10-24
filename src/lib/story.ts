// The home page scroll story. One scrubbed GSAP timeline writes `story.p`
// (0 to 1 across the pinned track); the 3D scene and the text read it, so
// both always sit on the same frame of the film.

export const story = {
  p: 0,
  mouse: { x: 0, y: 0 },
  // Callout elements the 3D scene pins to points on the jar.
  anchors: {} as Record<string, HTMLElement | null>,
  // The hero jar can be handled: the scene says whether the pointer is over
  // it, the page records drags and clicks.
  overJar: false,
  hand: { pressed: false, dragging: false, lastX: 0, moved: 0, velocity: 0, openedAt: -1 },
};

// The hero jar is only handled while the hero is on screen.
export const HANDLE_UNTIL = 0.07;

// Where each chapter sits on the timeline.
export const chapters = {
  hero: [0, 0.1],
  anatomy: [0.1, 0.34],
  refill: [0.34, 0.62],
  year: [0.62, 0.78],
  range: [0.78, 1],
} as const;

export type Chapter = keyof typeof chapters;

// The range chapter shows each product for an equal slice.
export const rangeStep = (chapters.range[1] - chapters.range[0]) / 4;

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
export const ease = (t: number) => t * t * (3 - 2 * t);
export const mix = (a: number, b: number, t: number) => a + (b - a) * t;

// Progress through one chapter, with an optional sub-range inside it.
export function local(p: number, chapter: Chapter, from = 0, to = 1) {
  const [a, b] = chapters[chapter];
  return seg(p, a + (b - a) * from, a + (b - a) * to);
}
