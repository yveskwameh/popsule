"use client";

import { useId, useState } from "react";

const faq = [
  { q: "What if I break the jar?", a: "We send a new one at cost, printed with the same name and tone." },
  { q: "Can I change my formula?", a: "Any month. The next refill follows whatever you last saved to your jar." },
  { q: "What happens to the canisters?", a: "Each refill comes with a prepaid sleeve. Send the empty can back and we clean and refill it." },
  { q: "When does my refill arrive?", a: "Every 30 days from your first order. We email a few days before each one ships, so you can change it first." },
  { q: "Can I pause or skip a month?", a: "Yes. Skip, pause or cancel from your account any time before your next refill ships. No fees, no calls." },
];

// One answer open at a time. The card grows to make room and the answer
// slides in, so you see it open rather than snap.
export default function Faq() {
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      {faq.map((f, i) => {
        const on = open === i;
        return (
          <div key={f.q} className={`rounded-2xl transition-colors duration-500 ${on ? "bg-mist" : "bg-mist/60 hover:bg-mist"}`}>
            <h3>
              <button
                type="button"
                id={`${id}-q${i}`}
                aria-expanded={on}
                aria-controls={`${id}-${i}`}
                onClick={() => setOpen(on ? null : i)}
                className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left text-2xl"
              >
                {f.q}
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-2xl leading-none transition-[rotate,background-color,color] duration-500 ${on ? "rotate-45 bg-graphite text-white" : "bg-white"}`}
                  aria-hidden
                >
                  +
                </span>
              </button>
            </h3>
            <div
              id={`${id}-${i}`}
              role="region"
              aria-labelledby={`${id}-q${i}`}
              inert={!on}
              className={`grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
            >
              <div className="overflow-hidden">
                <p
                  className={`max-w-xl px-6 pb-6 text-lg leading-relaxed text-muted transition-[opacity,translate] duration-500 ${on ? "translate-y-0 opacity-100 delay-100" : "-translate-y-2 opacity-0"}`}
                >
                  {f.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
