"use client";

import { useLayoutEffect, useRef } from "react";
import { Color, Euler, type Plane, Matrix4, Quaternion, Vector3, type InstancedMesh } from "three";
import { useParts } from "./model";

const REACH = 0.135; // half the capsule's length

// A seeded pile of capsules inside the jar. It only reshuffles when the fill
// height or the formula's colours change.
export default function Capsules({
  colors,
  top,
  radius = 0.66,
  count = 70,
  clip,
}: {
  colors: string[];
  top: number;
  radius?: number;
  count?: number;
  clip?: Plane[];
}) {
  const parts = useParts();
  const mesh = useRef<InstancedMesh>(null!);
  const key = colors.join();

  useLayoutEffect(() => {
    let seed = 9;
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const m = new Matrix4();
    const q = new Quaternion();
    const one = new Vector3(1, 1, 1);
    const p = new Vector3();
    const c = new Color();
    const palette = key.split(",");
    for (let i = 0; i < count; i++) {
      // Denser at the bottom, like a settled pile.
      const y = 0.09 + Math.pow(rand(), 1.6) * Math.max(0.05, top - 0.12);
      const r = Math.sqrt(rand()) * (radius - REACH);
      const a = rand() * Math.PI * 2;
      p.set(Math.cos(a) * r, y, Math.sin(a) * r);
      q.setFromEuler(new Euler(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI));
      mesh.current.setMatrixAt(i, m.compose(p, q, one));
      mesh.current.setColorAt(i, c.set(palette[i % palette.length]));
    }
    mesh.current.instanceMatrix.needsUpdate = true;
    if (mesh.current.instanceColor) mesh.current.instanceColor.needsUpdate = true;
  }, [key, top, radius, count]);

  return (
    <instancedMesh ref={mesh} args={[parts.Capsule, undefined, count]}>
      <meshPhysicalMaterial roughness={0.35} clearcoat={0.6} clearcoatRoughness={0.2} clippingPlanes={clip ?? null} />
    </instancedMesh>
  );
}
