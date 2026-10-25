"use client";

import { Suspense, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import Link from "next/link";
import { PerspectiveCamera, View } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import type { PerspectiveCamera as Camera } from "three";
import { useShallow } from "zustand/react/shallow";
import { productById, products, tones, toneHex } from "@/lib/brand";
import { decodeSnapshot, encodeSnapshot, LABEL_MAX, MAX_GOALS, newId, priceOf, sizes, sizeScale } from "@/lib/lab";
import { currentSnapshot, useLab } from "@/store/lab";
import { useBag } from "@/store/bag";
import ProductPair from "@/components/product/ProductPair";
import StudioLights from "@/components/canvas/StudioLights";
import Backdrop from "@/components/canvas/Backdrop";
import { allHandling, useHand } from "@/components/product/Handled";
import { Pair, Tones } from "@/components/ui/choices";
import { IconButton } from "@/components/ui/controls";
import BagButton from "@/components/ui/BagButton";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { copyText, downloadPoster, shareUrl } from "./share";

// Build your jar: the jar and refill on a big stage, every choice beside it
// on one screen. No steps; each change shows on the jar straight away.

const perDay = ["One a day", "Two a day", "Three a day"];
const toneName = (id: string) => tones.find((t) => t.id === id)!.name;

const icon = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
const UndoIcon = ({ flip }: { flip?: boolean }) => (
  <svg {...icon} style={flip ? { transform: "scaleX(-1)" } : undefined}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </svg>
);
const LinkIcon = () => (
  <svg {...icon}>
    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
  </svg>
);
const ImageIcon = () => (
  <svg {...icon}>
    <path d="M12 4v11" />
    <path d="m7 10 5 5 5-5" />
    <path d="M5 20h14" />
  </svg>
);

function Group({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-base">
        {title}
        {hint && <span className="italic text-muted"> · {hint}</span>}
      </h2>
      {children}
    </section>
  );
}

function Formula() {
  const goals = useLab((s) => s.goals);
  const toggleGoal = useLab((s) => s.toggleGoal);
  return (
    <Group title="Formula" hint={`pick up to ${MAX_GOALS === 3 ? "three" : MAX_GOALS}`}>
      <div className="grid grid-cols-2 gap-1.5">
        {products.map((p) => {
          const on = goals.includes(p.id);
          const full = !on && goals.length >= MAX_GOALS;
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={on}
              disabled={full}
              onClick={() => toggleGoal(p.id)}
              className={`flex h-11 items-center gap-2.5 rounded-2xl pl-3 pr-3 text-left transition-colors duration-300 disabled:opacity-40 ${on ? "bg-graphite text-white" : "bg-mist hover:bg-line/70"}`}
            >
              <span className="h-4 w-4 shrink-0 rounded-full" style={{ background: toneHex(p.tone) }} aria-hidden />
              <span className="text-lg leading-none">{p.goal}</span>
              <span className={`ml-auto truncate text-sm ${on ? "text-white/60" : "text-muted"}`}>{p.name}</span>
            </button>
          );
        })}
      </div>
    </Group>
  );
}

function Capsules() {
  const size = useLab((s) => s.size);
  const setSize = useLab((s) => s.setSize);
  return (
    <Group title="Capsules a day" hint="the jar grows to match">
      <div className="grid grid-cols-3 gap-1.5" role="radiogroup" aria-label="Capsules a day">
        {sizes.map((n, i) => {
          const on = size === n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setSize(n)}
              className={`flex flex-col items-center gap-1.5 rounded-2xl py-2 transition-colors duration-300 ${on ? "bg-graphite text-white" : "bg-mist hover:bg-line/70"}`}
            >
              <span className="flex gap-1" aria-hidden>
                {[0, 1, 2].map((c) => (
                  <span key={c} className={`block h-5 w-2.5 rounded-full bg-current transition-opacity duration-300 ${c <= i ? "" : "opacity-20"}`} />
                ))}
              </span>
              <span className="text-base leading-none">{perDay[i]}</span>
            </button>
          );
        })}
      </div>
    </Group>
  );
}

function Look() {
  const s = useLab(useShallow((s) => ({ lid: s.lid, refill: s.refill, matchRefill: s.matchRefill, glass: s.glass, metal: s.metal })));
  const { setLid, setRefill, setMatchRefill, setGlass, setMetal } = useLab.getState();
  return (
    <Group title="Look" hint="brushed metal adds $2">
      <div className="flex flex-col gap-2 rounded-2xl bg-mist px-3.5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <span className="text-base">
            Jar lid <span className="italic text-muted max-sm:hidden">{toneName(s.lid)}</span>
          </span>
          <Tones value={s.lid} onChange={setLid} label="Jar lid tone" options={tones} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <span className="flex items-center gap-2 text-base">
            Refill
            {/* A real switch, so it reads as something to flip. */}
            <button
              type="button"
              role="switch"
              aria-checked={s.matchRefill}
              onClick={() => setMatchRefill(!s.matchRefill)}
              className="group inline-flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 text-sm shadow-[0_1px_2px_rgb(0_0_0/0.06)] transition-shadow hover:shadow-[0_0_0_1px_var(--color-line),0_2px_6px_rgb(0_0_0/0.08)]"
            >
              <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors duration-300 ${s.matchRefill ? "bg-graphite" : "bg-graphite/15 group-hover:bg-graphite/25"}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-[left] duration-300 ${s.matchRefill ? "left-[1.125rem]" : "left-0.5"}`} />
              </span>
              Match lid
            </button>
          </span>
          <Tones value={s.refill} onChange={setRefill} label="Refill tone" options={tones} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Pair value={s.glass} options={["frosted", "clear"] as const} onChange={setGlass} render={(g) => (g === "frosted" ? "Frosted" : "Clear")} />
        <Pair value={s.metal} options={["satin", "brushed"] as const} onChange={setMetal} render={(m) => (m === "satin" ? "Satin" : "Brushed")} />
      </div>
    </Group>
  );
}

function Label() {
  const label = useLab((s) => s.label);
  const { setLabel, checkpoint } = useLab.getState();
  return (
    <Group title="Label" hint="printed on the jar and every refill">
      <div className="flex gap-1.5">
        <input
          type="text"
          value={label.text}
          maxLength={LABEL_MAX}
          placeholder="Your name"
          aria-label="Name on the label"
          onFocus={checkpoint}
          onChange={(e) => setLabel({ text: e.target.value }, false)}
          className={`h-11 min-w-0 flex-1 rounded-full bg-mist px-4 text-lg outline-none focus:ring-2 focus:ring-graphite/30 ${label.font === "serif" ? "italic" : "font-display"}`}
        />
        <Pair value={label.font} options={["display", "serif"] as const} onChange={(font) => setLabel({ font })} render={(f) => (f === "display" ? "Classic" : <em>Italic</em>)} />
      </div>
    </Group>
  );
}

function Checkout() {
  const design = useLab(useShallow((s) => ({ size: s.size, goals: s.goals, metal: s.metal, label: s.label })));
  const add = useBag((b) => b.add);
  const [added, setAdded] = useState(false);
  const price = priceOf(design);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl bg-graphite p-4 pl-5 text-white xl:p-5 xl:pl-6">
      <div>
        <p className="font-display text-4xl leading-none tabular-nums xl:text-5xl">
          ${price.total}
          <span className="ml-1.5 font-sans text-base font-normal tracking-normal text-white/60">a month</span>
        </p>
        <p className="mt-1.5 text-sm text-white/60">
          {design.size} capsules
          {price.goals > 0 && ` · +$${price.goals} goals`}
          {price.finish > 0 && ` · +$${price.finish} brushed`} · jar free
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          add({ id: newId(), name: design.label.text || "My Popsule", snapshot: currentSnapshot() });
          useBag.getState().setOpen(true);
          setAdded(true);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setAdded(false), 2000);
        }}
        data-magnetic
        className="inline-flex h-12 shrink-0 items-center rounded-full bg-cta px-6 text-lg text-on-cta transition-colors hover:bg-cta-hover active:scale-[0.98] xl:h-14 xl:px-8"
      >
        <span aria-live="polite">{added ? "Added" : "Add to bag"}</span>
      </button>
    </div>
  );
}

// Centres the pair in the open space between the title and the buttons, on
// any screen. The distance leaves room for the tallest jar with its lid off;
// if an opened lid would still reach the text, the pair drops just enough.
const FOV = 30;
const WIDTH = 4.4;
const LIFT = 0.65;
const TALLEST = 1.85 * 1.2;

function Framing({ insets, scale, children }: { insets: RefObject<{ top: number; bottom: number }>; scale: number; children: ReactNode }) {
  const camera = useRef<Camera>(null!);
  const aim = useRef<number | null>(null);
  useFrame(({ size }, dt) => {
    const tan = Math.tan(((FOV / 2) * Math.PI) / 180);
    const { top, bottom } = insets.current;
    const free = Math.max(0.35, (size.height - top - bottom) / size.height);
    const d = Math.max(6, (TALLEST + LIFT + 0.1) / 2 / (tan * free), WIDTH / 2 / (tan * (size.width / size.height)));
    const half = d * tan; // half the visible height where the jars stand
    const height = 1.85 * scale;
    // Look at y and the free band's middle lands on the pair's middle.
    let y = height / 2 - (half * (bottom - top)) / size.height;
    const bandTop = y + half * (1 - (2 * top) / size.height);
    y += Math.max(0, height + LIFT - bandTop);
    aim.current = aim.current === null ? y : aim.current + (y - aim.current) * (1 - Math.exp(-dt * 5));
    camera.current.position.set(0, aim.current + d * 0.1, d);
    camera.current.lookAt(0, aim.current, 0);
  });
  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault fov={FOV} />
      {children}
    </>
  );
}

function Stage() {
  const design = useLab(
    useShallow((s) => ({
      goals: s.goals,
      size: s.size,
      lid: s.lid,
      refill: s.refill,
      matchRefill: s.matchRefill,
      glass: s.glass,
      metal: s.metal,
      label: s.label,
    })),
  );
  const canUndo = useLab((s) => s.past.length > 0);
  const canRedo = useLab((s) => s.future.length > 0);
  const handle = useHand(allHandling);
  const stage = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLDivElement>(null);
  const tools = useRef<HTMLDivElement>(null);
  const insets = useRef({ top: 0, bottom: 0 });
  useEffect(() => {
    // The view sits 8px inside the stage, hence the small corrections.
    const measure = () => {
      insets.current = { top: (title.current?.offsetHeight ?? 0) - 8, bottom: (tools.current?.offsetHeight ?? 0) - 8 };
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (title.current) ro.observe(title.current);
    if (tools.current) ro.observe(tools.current);
    return () => ro.disconnect();
  }, []);
  const [note, setNote] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const flash = (msg: string) => {
    setNote(msg);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setNote(""), 2200);
  };

  const summary = [
    design.goals.map((g) => productById(g).goal).join(" + "),
    perDay[sizes.indexOf(design.size)].toLowerCase(),
    `${toneName(design.lid).toLowerCase()} lid`,
    `${design.glass} glass`,
  ].join(" · ");

  return (
    <div ref={stage} className={`relative h-[44svh] shrink-0 select-none overflow-hidden rounded-3xl bg-mist md:h-auto md:min-h-0 md:flex-1 ${handle.cursor}`} {...handle.props}>
      <View className="absolute inset-2">
        <StudioLights />
        <Suspense fallback={null}>
          <Backdrop />
          <Framing insets={insets} scale={sizeScale[design.size]}>
            <ProductPair design={design} handle={{ hand: handle.hand, handling: allHandling }} backdrop={false} />
          </Framing>
        </Suspense>
      </View>

      <div ref={title} className="pointer-events-none absolute inset-x-0 top-0 z-[15] p-4 md:p-7">
        <h1 className="text-sm italic text-muted md:text-base">Build your jar</h1>
        <p className={`break-words text-3xl leading-tight md:text-5xl ${design.label.font === "serif" ? "italic" : "font-display"}`}>
          {design.label.text || "Your Popsule"}
        </p>
        <p className="mt-1 hidden text-base text-muted md:block">{summary}</p>
        <p className="mt-1 text-sm italic text-muted" aria-live="polite">
          {note || (
            <>
              Drag to turn<span className="max-md:hidden"> · click a lid to open it</span>
            </>
          )}
        </p>
      </div>

      <div ref={tools} className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] flex items-end justify-between gap-2 p-3 md:p-6">
        <div className="pointer-events-auto flex items-center gap-1.5">
          <IconButton label="Undo" disabled={!canUndo} onClick={() => useLab.getState().undo()} className="max-md:h-9 max-md:w-9">
            <UndoIcon />
          </IconButton>
          <IconButton label="Redo" disabled={!canRedo} onClick={() => useLab.getState().redo()} className="max-md:h-9 max-md:w-9">
            <UndoIcon flip />
          </IconButton>
          <button
            type="button"
            onClick={() => useLab.getState().surprise()}
            data-magnetic
            className="h-9 rounded-full border border-line bg-white px-4 text-base hover:bg-mist md:h-11 md:px-5"
          >
            Surprise me
          </button>
        </div>
        <div className="pointer-events-auto flex gap-1.5">
          <IconButton
            label="Copy a link to this design"
            className="max-md:h-9 max-md:w-9"
            onClick={async () => flash((await copyText(shareUrl(currentSnapshot()))) ? "Link copied" : "Copy the link from the address bar")}
          >
            <LinkIcon />
          </IconButton>
          <IconButton
            label="Save a picture"
            className="max-md:h-9 max-md:w-9"
            onClick={async () => {
              if (stage.current) await downloadPoster(stage.current, design.label.text);
              flash("Picture saved");
            }}
          >
            <ImageIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

export default function LabClient() {

  // Open a shared design from ?d=, then keep the address bar pointing at the
  // current design so the URL is always a working share link.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("d");
    const shared = code ? decodeSnapshot(code) : null;
    if (shared) useLab.getState().load(shared);

    let timer: ReturnType<typeof setTimeout>;
    const unsubscribe = useLab.subscribe((s, prev) => {
      const same = (["goals", "size", "lid", "refill", "matchRefill", "glass", "metal", "label"] as const).every((k) => s[k] === prev[k]);
      if (same) return;
      clearTimeout(timer);
      timer = setTimeout(() => {
        window.history.replaceState(null, "", `/build?d=${encodeSnapshot(currentSnapshot())}`);
      }, 400);
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (typing || !(e.metaKey || e.ctrlKey) || e.key.toLowerCase() !== "z") return;
      e.preventDefault();
      if (e.shiftKey) useLab.getState().redo();
      else useLab.getState().undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main id="main" className="flex h-dvh flex-col overflow-hidden bg-white">
      <header className="frame flex h-16 shrink-0 items-center justify-between">
        <Link href="/" className="font-display text-3xl">
          Popsule
        </Link>
        <span className="flex items-center gap-1">
          <ThemeToggle />
          <BagButton />
        </span>
      </header>

      <div className="frame flex min-h-0 flex-1 flex-col gap-3 pb-3 md:flex-row md:gap-5 md:pb-6">
        <Stage />

        <aside className="flex min-h-0 flex-1 flex-col gap-3 md:w-[25rem] md:flex-none lg:w-[27rem]">
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain pt-1 md:justify-center-safe md:gap-5 xl:gap-6" data-lenis-prevent>
            <Formula />
            <Capsules />
            <Look />
            <Label />
          </div>
          <Checkout />
        </aside>
      </div>
    </main>
  );
}
