"use client";

import type { ComponentProps, RefObject } from "react";
import type { Group } from "three";
import type { ThreeElements } from "@react-three/fiber";
import { toneHex } from "@/lib/brand";
import { capsuleColors, sizeScale, type LabSnapshot } from "@/lib/lab";
import SoftShadow from "@/components/canvas/SoftShadow";
import Backdrop from "@/components/canvas/Backdrop";
import Handled, { type Hand, type Handling } from "./Handled";
import Jar from "./Jar";
import Canister from "./Canister";

type Props = ThreeElements["group"] & {
  design: LabSnapshot;
  // When given, the jar and the refill each answer the pointer on their own.
  handle?: { hand: RefObject<Hand>; handling: Handling };
  backdrop?: boolean; // off when the pair moves, so the wall stays put
};

// The jar and its refill side by side, standing on y = 0.
export default function ProductPair({ design, handle, backdrop = true, ...group }: Props) {
  const k = sizeScale[design.size];

  const jar = (rig?: ComponentProps<typeof Jar>["rig"]) => (
    <Jar
      lid={toneHex(design.lid)}
      glass={design.glass}
      metal={design.metal}
      scale={k}
      label={design.label}
      capsules={capsuleColors(design.goals)}
      rig={rig}
    />
  );
  const can = (rig?: { lid?: RefObject<Group | null> }) => (
    <Canister
      color={toneHex(design.refill)}
      metal={design.metal}
      scale={k}
      label={design.label}
      rig={rig}
      capsules={capsuleColors(design.goals)}
    />
  );

  return (
    <group {...group}>
      <group position-x={-0.95}>
        {handle ? (
          <Handled hand={handle.hand} handling={handle.handling} bounds={[0.85, 1.85 * k]} recenter={false}>
            {(rig) => jar(rig)}
          </Handled>
        ) : (
          jar()
        )}
      </group>
      <group position-x={0.95}>
        {handle ? (
          <Handled hand={handle.hand} handling={handle.handling} bounds={[0.75, 1.7 * k]} lift={0.5} recenter={false}>
            {(rig) => can({ lid: rig.lid })}
          </Handled>
        ) : (
          can()
        )}
      </group>
      {backdrop && <Backdrop />}
      <SoftShadow position={[-0.95, 0.002, 0]} size={2.4} opacity={0.28} />
      <SoftShadow position={[0.95, 0.002, 0]} size={2.2} opacity={0.28} />
    </group>
  );
}
