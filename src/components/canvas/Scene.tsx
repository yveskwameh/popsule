"use client";

import type { RefObject } from "react";
import { AgXToneMapping } from "three";
import { Canvas } from "@react-three/fiber";
import { Preload, View } from "@react-three/drei";
import FrameGrab from "./FrameGrab";

// One WebGL canvas for the whole site. Pages place <View> elements in the DOM
// and the canvas draws into each one, so 3D survives route changes.
export default function Scene({ eventSource }: { eventSource: RefObject<HTMLElement> }) {
  return (
    <Canvas
      aria-hidden
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 10 }}
      eventSource={eventSource}
      eventPrefix="client"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      // AgX keeps pale glass and earth tones from blowing out like ACES does.
      onCreated={({ gl }) => {
        gl.toneMapping = AgXToneMapping;
        // The scroll story pours capsules into the jar with a clipping plane.
        gl.localClippingEnabled = true;
      }}
    >
      <View.Port />
      <FrameGrab />
      <Preload all />
    </Canvas>
  );
}
