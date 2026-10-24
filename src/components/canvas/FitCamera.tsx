"use client";

import { PerspectiveCamera } from "@react-three/drei";
import { useThree } from "@react-three/fiber";

// A camera that backs off until a scene `width` units wide fits the View,
// so the jar and refill never get cropped on narrow screens.
export default function FitCamera({
  width,
  minDistance,
  height = 0.9,
  fov = 30,
}: {
  width: number;
  minDistance: number;
  height?: number;
  fov?: number;
}) {
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height));
  const halfTan = Math.tan(((fov / 2) * Math.PI) / 180);
  const distance = Math.max(minDistance, width / 2 / (halfTan * aspect));
  return <PerspectiveCamera makeDefault position={[0, height, distance]} fov={fov} rotation-x={-0.08} />;
}
