// Read once in the browser; the 3D uses it to drop idle sway.
export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
