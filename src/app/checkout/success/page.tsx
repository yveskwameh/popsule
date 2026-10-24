import { Suspense } from "react";
import Link from "next/link";
import Receipt from "@/components/checkout/Receipt";

export const metadata = {
  title: "Thank you",
  robots: { index: false },
};

export default function Success() {
  return (
    <main id="main" className="flex min-h-dvh flex-col bg-white md:h-dvh">
      <header className="frame flex h-16 shrink-0 items-center justify-between">
        <Link href="/" className="font-display text-3xl">
          Popsule
        </Link>
        <Link href="/" className="text-lg text-muted hover:text-graphite">
          Back to the shop
        </Link>
      </header>
      <div className="frame flex min-h-0 flex-1 flex-col">
        <Suspense fallback={<div className="flex-1" />}>
          <Receipt />
        </Suspense>
      </div>
    </main>
  );
}
