"use client";

import type { Ref } from "react";
import type { Group, Plane } from "three";
import type { ThreeElements } from "@react-three/fiber";
import { palette } from "@/lib/brand";
import type { Glass, LabelFont, Metal } from "@/lib/lab";
import { JAR, useParts } from "./model";
import { brushedTexture, useLabelTexture } from "./textures";
import Capsules from "./Capsules";

type Props = ThreeElements["group"] & {
  lid: string;
  glass: Glass;
  metal: Metal;
  scale?: number; // height scale from the capsule count
  label: { text: string; font: LabelFont };
  capsules: string[];
  // Handles on the moving parts, for the scroll story.
  rig?: { lid?: Ref<Group>; label?: Ref<Group>; pile?: Ref<Group> };
  clip?: Plane[];
};

// The shelf jar: frosted or clear glass with an anodised lid. Origin at the base.
export default function Jar({ lid, glass, metal, scale: k = 1, label, capsules, rig, clip, ...group }: Props) {
  const parts = useParts();
  const map = useLabelTexture(label.text, label.font, palette.graphite);
  const rise = (k - 1) * JAR.lidBase;

  return (
    <group {...group}>
      <mesh geometry={parts.Jar_Glass} scale-y={k}>
        <meshPhysicalMaterial
          key={glass}
          color="#F4F6F5"
          transmission={1}
          roughness={glass === "frosted" ? 0.34 : 0.04}
          thickness={0.35}
          ior={1.5}
          clearcoat={glass === "clear" ? 1 : 0}
        />
      </mesh>
      <group ref={rig?.label}>
        <mesh geometry={parts.Jar_Label} position-y={(k - 1) * JAR.labelCenter}>
          <meshStandardMaterial map={map} transparent roughness={0.5} depthWrite={false} />
        </mesh>
      </group>
      <group position-y={rise}>
        <mesh geometry={parts.Jar_Thread}>
          <meshPhysicalMaterial color="#F4F6F5" transmission={1} roughness={0.3} thickness={0.05} />
        </mesh>
        <group ref={rig?.lid}>
          <mesh geometry={parts.Jar_Lid}>
            <meshPhysicalMaterial
              key={metal}
              color={lid}
              metalness={0.6}
              roughness={metal === "brushed" ? 0.3 : 0.4}
              clearcoat={0.25}
              clearcoatRoughness={0.4}
              bumpMap={metal === "brushed" ? brushedTexture() : null}
              bumpScale={0.4}
            />
          </mesh>
        </group>
      </group>
      <group ref={rig?.pile}>
        <Capsules colors={capsules} top={JAR.height * k * 0.62} clip={clip} />
      </group>
    </group>
  );
}
