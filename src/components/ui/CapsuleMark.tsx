import { useId } from "react";

// The Popsule capsule, tilted like the app icon. `fill` (0 to 1) sets how far
// the clay has filled it from the bottom; leave it out and the fill is full
// height with the class capsule-fill, for CSS to animate (the page curtain).
export default function CapsuleMark({ fill, className = "" }: { fill?: number; className?: string }) {
  const clip = useId();
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <defs>
        <clipPath id={clip}>
          <rect x="22" y="12" width="20" height="40" rx="10" />
        </clipPath>
      </defs>
      <g transform="rotate(-35 32 32)">
        <rect x="22" y="12" width="20" height="40" rx="10" fill="currentColor" opacity="0.14" />
        <rect
          x="22"
          y={12 + 40 * (1 - (fill ?? 1))}
          width="20"
          height={40 * (fill ?? 1)}
          clipPath={`url(#${clip})`}
          className={`fill-cta ${fill === undefined ? "capsule-fill" : ""}`}
        />
        <rect x="22" y="12" width="20" height="40" rx="10" fill="none" stroke="currentColor" strokeWidth="2" />
      </g>
    </svg>
  );
}
