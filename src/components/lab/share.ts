"use client";

import { palette } from "@/lib/brand";
import { encodeSnapshot, type LabSnapshot } from "@/lib/lab";
import { grabFrame } from "@/components/canvas/FrameGrab";

export function shareUrl(s: LabSnapshot) {
  return `${window.location.origin}/build?d=${encodeSnapshot(s)}`;
}

// The clipboard API only exists on https and localhost; fall back to a hidden
// textarea so copying also works when testing over the LAN.
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

// Crops the stage out of the shared WebGL canvas right after a frame renders
// and frames it as a 4:5 poster with the product's name.
export async function downloadPoster(stage: HTMLElement, name: string) {
  const W = 1080;
  const H = 1350;
  const out = document.createElement("canvas");
  out.width = W;
  out.height = H;
  const ctx = out.getContext("2d")!;
  ctx.fillStyle = palette.mist;
  ctx.fillRect(0, 0, W, H);

  await grabFrame((gl) => {
    const view = stage.getBoundingClientRect();
    const frame = gl.getBoundingClientRect();
    const ratio = gl.width / frame.width;
    // A centred 4:3 slice of the stage, wide enough for the jar and its refill.
    const sw = Math.min(view.width, view.height * (4 / 3)) * ratio;
    const sh = sw * 0.75;
    const sx = (view.left - frame.left) * ratio + (view.width * ratio - sw) / 2;
    const sy = (view.top - frame.top) * ratio + (view.height * ratio - sh) / 2;
    ctx.drawImage(gl, sx, sy, sw, sh, 0, 120, W, W * 0.75);
  });

  const css = getComputedStyle(document.documentElement);
  const display = css.getPropertyValue("--font-spartan").trim();
  const accent = css.getPropertyValue("--font-dm-serif").trim();
  ctx.fillStyle = palette.graphite;
  ctx.textAlign = "center";
  ctx.font = `600 26px ${display}`;
  ctx.letterSpacing = "8px";
  ctx.fillText("POPSULE", W / 2, 80);
  ctx.letterSpacing = "0px";
  ctx.font = `600 120px ${display}`;
  ctx.fillText(name || "My Popsule", W / 2, H - 200);
  ctx.font = `italic 40px ${accent}`;
  ctx.fillText("One jar for life, refills by the month.", W / 2, H - 120);

  const blob = await new Promise<Blob | null>((r) => out.toBlob(r, "image/png"));
  if (!blob) return;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `popsule-${(name || "jar").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
