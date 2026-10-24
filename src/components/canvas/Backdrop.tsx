"use client";

import { palette } from "@/lib/brand";

// A wall behind the product so frosted glass refracts a room, not empty black.
// It matches the page colour, so it reads as the page itself.
export default function Backdrop({ color = palette.mist }: { color?: string }) {
  return (
    <mesh position={[0, 3, -6]} scale={[60, 30, 1]}>
      <planeGeometry />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  );
}
