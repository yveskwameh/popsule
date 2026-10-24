"use client";

import { useFrame } from "@react-three/fiber";

// Runs a callback on the WebGL canvas straight after every View has drawn,
// while the frame is still readable. This avoids preserveDrawingBuffer, which
// makes transparent layers pile up frame after frame inside scissored Views.
let waiting: ((canvas: HTMLCanvasElement) => void) | null = null;

export function grabFrame<T>(fn: (canvas: HTMLCanvasElement) => T) {
  return new Promise<T>((resolve) => {
    waiting = (canvas) => resolve(fn(canvas));
  });
}

export default function FrameGrab() {
  // drei Views render at priority 1; this runs after them.
  useFrame(({ gl }) => {
    if (!waiting) return;
    const run = waiting;
    waiting = null;
    run(gl.domElement);
  }, 100);
  return null;
}
