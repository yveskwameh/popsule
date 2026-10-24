"use client";

import { useEffect, useMemo } from "react";
import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Texture } from "three";
import type { LabelFont } from "@/lib/lab";

let brushed: Texture | null = null;

// Fine streaks running around the can, used as a bump map for brushed metal.
export function brushedTexture() {
  if (brushed) return brushed;
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;
  const ctx = c.getContext("2d")!;
  let seed = 3;
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  for (let y = 0; y < c.height; y++) {
    const g = 110 + Math.floor(rand() * 60);
    ctx.fillStyle = `rgb(${g},${g},${g})`;
    ctx.fillRect(0, y, c.width, 1);
  }
  brushed = new CanvasTexture(c);
  brushed.wrapS = brushed.wrapT = RepeatWrapping;
  brushed.repeat.set(1, 3);
  return brushed;
}

// Labels wrap the whole band but print on the front third. Blender's front
// (-Y) becomes u = 0.25 after the glTF export.
const W = 2048;
const H = 292;
const FRONT = 0.25;

// Classic labels print in the headline sans, Italic ones in the serif accent.
function family(font: LabelFont | "brand") {
  const name = font === "serif" ? "--font-dm-serif" : "--font-spartan";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || "serif";
}

function drawLabel(canvas: HTMLCanvasElement, texture: Texture, text: string, font: LabelFont, ink: string) {
  const ctx = canvas.getContext("2d")!;
  const cx = W * FRONT;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = ink;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.font = `600 26px ${family("brand")}`;
  ctx.letterSpacing = "7px";
  ctx.fillText("POPSULE", cx, 82);

  ctx.letterSpacing = "0px";
  let size = 112;
  const style = font === "serif" ? "italic 400 " : "600 ";
  do {
    ctx.font = `${style}${size}px ${family(font)}`;
    size -= 4;
  } while (ctx.measureText(text).width > 560 && size > 40);
  ctx.fillText(text, cx, 184);
  texture.needsUpdate = true;
}

export function useLabelTexture(text: string, font: LabelFont, ink: string) {
  const surface = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const texture = new CanvasTexture(canvas);
    // The Blender UVs already run bottom-up, so the canvas must not be flipped again.
    texture.flipY = false;
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 8;
    return { canvas, texture };
  }, []);

  useEffect(() => {
    let live = true;
    const draw = () => live && drawLabel(surface.canvas, surface.texture, text, font, ink);
    draw();
    // Webfonts may still be loading on first paint; redraw once they are in.
    document.fonts.ready.then(draw);
    return () => {
      live = false;
    };
  }, [surface, text, font, ink]);

  useEffect(() => () => surface.texture.dispose(), [surface]);

  return surface.texture;
}
