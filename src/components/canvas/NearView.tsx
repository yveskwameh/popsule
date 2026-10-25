"use client";

import { useRef, type ReactNode } from "react";
import { View } from "@react-three/drei";
import { useNear } from "@/lib/useNear";

// A drei View that only exists near the screen. Below-the-fold sections use
// it, so their 3D is built a screen before you reach it, not on page load.
export default function NearView({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useNear(ref);
  return (
    <div ref={ref} className={className}>
      {near && <View className="h-full w-full">{children}</View>}
    </div>
  );
}
