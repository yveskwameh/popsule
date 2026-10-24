"use client";

import { useRef, type ReactNode } from "react";
import dynamic from "next/dynamic";
import SmoothScroll from "./SmoothScroll";
import Cursor from "./Cursor";
import ScrollRail from "./ScrollRail";
import BagDrawer from "./bag/BagDrawer";

const Scene = dynamic(() => import("./canvas/Scene"), { ssr: false });

export default function AppShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null!);

  return (
    <div ref={ref} className="relative">
      <SmoothScroll>{children}</SmoothScroll>
      <Scene eventSource={ref} />
      <ScrollRail />
      <BagDrawer />
      <Cursor />
    </div>
  );
}
