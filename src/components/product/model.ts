"use client";

import { useGLTF } from "@react-three/drei";
import { BufferAttribute, type BufferGeometry, type Mesh } from "three";

// Geometry built in Blender by blender/models.py, then meshopt-compressed
// (command at the top of that file). Materials are assigned in code so every product can
// recolour the same meshes.
const URL = "/models/popsule.glb";

export const JAR = { height: 1.45, labelCenter: 0.77, lidBase: 1.43 };
export const CAN = { height: 1.35, labelCenter: 0.875, lidBase: 1.3 };

type Part =
  | "Jar_Glass"
  | "Jar_Thread"
  | "Jar_Lid"
  | "Jar_Label"
  | "Can_Body"
  | "Can_Lid"
  | "Can_Line"
  | "Can_Label"
  | "Capsule";

// Meshopt stores positions as quantized integers and moves the scale onto
// the node. Unpack each mesh once into plain floats in its real size, so the
// rest of the code can use the geometry directly.
const unpacked = new WeakMap<Mesh, BufferGeometry>();
function unpack(mesh: Mesh) {
  let g = unpacked.get(mesh);
  if (g) return g;
  g = mesh.geometry.clone();
  for (const name of Object.keys(g.attributes)) {
    const a = g.getAttribute(name);
    const out = new Float32Array(a.count * a.itemSize);
    for (let i = 0; i < a.count; i++) for (let k = 0; k < a.itemSize; k++) out[i * a.itemSize + k] = a.getComponent(i, k);
    g.setAttribute(name, new BufferAttribute(out, a.itemSize));
  }
  mesh.updateMatrix();
  g.applyMatrix4(mesh.matrix);
  g.computeBoundingBox();
  g.computeBoundingSphere();
  unpacked.set(mesh, g);
  return g;
}

export function useParts(): Record<Part, BufferGeometry> {
  const { nodes } = useGLTF(URL);
  return new Proxy({} as Record<Part, BufferGeometry>, {
    get: (_, name: string) => unpack(nodes[name] as Mesh),
  });
}

useGLTF.preload(URL);
