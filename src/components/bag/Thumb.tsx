import { toneHex } from "@/lib/brand";
import type { LabSnapshot } from "@/lib/lab";

// A flat drawing of the pair in its tones, small enough for a bag line.
export default function Thumb({ s }: { s: LabSnapshot }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
      <rect x="7" y="22" width="26" height="32" rx="6" fill={s.glass === "frosted" ? "#E4E3DF" : "#EEF0F1"} />
      <rect x="9" y="38" width="22" height="14" rx="4" fill="#fff" opacity="0.55" />
      <rect x="6" y="15" width="28" height="9" rx="3" fill={toneHex(s.lid)} />
      <rect x="37" y="25" width="21" height="29" rx="4" fill={toneHex(s.refill)} />
      <rect x="36" y="19" width="23" height="8" rx="3" fill="#2A2C30" />
    </svg>
  );
}
