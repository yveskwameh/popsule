"use client";

import { Environment, Lightformer } from "@react-three/drei";

// Soft studio lighting built from local light panels, so there is no HDR download.
export default function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 5, 4]} intensity={1.4} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2} position={[0, 5, -2]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
        <Lightformer form="ring" intensity={1.5} position={[4, 2, 3]} scale={2} />
      </Environment>
    </>
  );
}
