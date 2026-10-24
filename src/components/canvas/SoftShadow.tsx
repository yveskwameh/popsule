"use client";

import { useMemo } from "react";
import { CanvasTexture } from "three";
import type { ThreeElements } from "@react-three/fiber";
import { palette } from "@/lib/brand";

// A baked radial shadow. drei's ContactShadows re-renders into a target every
// frame, which builds up inside scissored Views; a static blob can't.
export default function SoftShadow({ size = 2, opacity = 0.32, ...props }: ThreeElements["mesh"] & { size?: number; opacity?: number }) {
  const map = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d")!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, palette.graphite);
    g.addColorStop(1, "rgba(42, 44, 48, 0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new CanvasTexture(c);
  }, []);

  return (
    <mesh rotation-x={-Math.PI / 2} scale={[size, size * 0.55, 1]} {...props}>
      <planeGeometry />
      <meshBasicMaterial map={map} transparent opacity={opacity} depthWrite={false} />
    </mesh>
  );
}
