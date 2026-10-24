"use client";

import { Suspense, useEffect, useMemo } from "react";
import { View } from "@react-three/drei";
import { decodeSnapshot, startingSnapshot } from "@/lib/lab";
import { useBag } from "@/store/bag";
import ProductPair from "@/components/product/ProductPair";
import StudioLights from "@/components/canvas/StudioLights";
import FitCamera from "@/components/canvas/FitCamera";
import Backdrop from "@/components/canvas/Backdrop";
import { allHandling, useHand } from "@/components/product/Handled";

// The jar and refill from the order, to hold one more time.
export function OrderJar({ design }: { design?: string }) {
  const snapshot = useMemo(() => (design && decodeSnapshot(design)) || startingSnapshot(), [design]);
  const handle = useHand(allHandling);
  return (
    <div className={`relative h-full w-full select-none p-2 ${handle.cursor}`} {...handle.props}>
      <View className="h-full w-full">
        <FitCamera width={4.4} minDistance={7.4} />
        <StudioLights />
        <Suspense fallback={null}>
          <Backdrop />
          <group position-y={-0.85}>
            <ProductPair design={snapshot} handle={{ hand: handle.hand, handling: allHandling }} backdrop={false} />
          </group>
        </Suspense>
      </View>
    </div>
  );
}

// The order went through, so the bag starts empty again.
export function ClearBag() {
  useEffect(() => {
    void Promise.resolve(useBag.persist.rehydrate()).then(() => {
      useBag.getState().clear();
      useBag.getState().setOpen(false);
    });
  }, []);
  return null;
}
