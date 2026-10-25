"use client";

import { surfaces, type Surface } from "@/lib/brand";
import { useTheme } from "@/lib/theme";

// A wall behind the product so frosted glass refracts a room, not empty black.
// It matches the surface the view sits on, so it reads as the page itself.
export default function Backdrop({ surface = "mist" }: { surface?: Surface }) {
  const color = surfaces[surface][useTheme()];
  return (
    <mesh position={[0, 3, -6]} scale={[60, 30, 1]}>
      <planeGeometry />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}
