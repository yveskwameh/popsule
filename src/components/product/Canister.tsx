"use client";

import type { Ref } from "react";
import type { Group } from "three";
import type { ThreeElements } from "@react-three/fiber";
import { palette } from "@/lib/brand";
import { inkFor, type LabelFont, type Metal } from "@/lib/lab";
import { CAN, useParts } from "./model";
import { brushedTexture, useLabelTexture } from "./textures";
import Capsules from "./Capsules";

type Props = ThreeElements["group"] & {
  color: string;
  metal: Metal;
  scale?: number;
  label: { text: string; font: LabelFont };
  rig?: { lid?: Ref<Group> };
  capsules?: string[]; // the month's capsules, seen when the lid comes off
};

// The monthly refill: an open anodised can in the product tone, graphite lid,
// steel line. Origin at the base.
export default function Canister({ color, metal, scale: k = 1, label, rig, capsules, ...group }: Props) {
  const parts = useParts();
  const map = useLabelTexture(label.text, label.font, inkFor(color));
  const bump = metal === "brushed" ? brushedTexture() : null;

  return (
    <group {...group}>
      <mesh geometry={parts.Can_Body} scale-y={k}>
        <meshPhysicalMaterial
          key={metal}
          color={color}
          metalness={0.6}
          roughness={metal === "brushed" ? 0.32 : 0.42}
          clearcoat={0.2}
          clearcoatRoughness={0.4}
          bumpMap={bump}
          bumpScale={0.4}
        />
      </mesh>
      <mesh geometry={parts.Can_Label} position-y={(k - 1) * CAN.labelCenter}>
        <meshStandardMaterial map={map} transparent roughness={0.6} metalness={0} depthWrite={false} />
      </mesh>
      <mesh geometry={parts.Can_Line}>
        <meshStandardMaterial color={palette.steel} metalness={1} roughness={0.22} />
      </mesh>
      <group ref={rig?.lid}>
        <mesh geometry={parts.Can_Lid} position-y={(k - 1) * CAN.lidBase}>
          <meshPhysicalMaterial color={palette.graphite} metalness={0.4} roughness={0.45} clearcoat={0.2} />
        </mesh>
      </group>
      {capsules && <Capsules colors={capsules} top={CAN.height * k * 0.8} radius={0.62} count={60} />}
    </group>
  );
}
