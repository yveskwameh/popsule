import Link from "next/link";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata = {
  title: "Checkout",
  robots: { index: false },
};

export default function Checkout() {
  return (
    <main id="main" className="flex min-h-dvh flex-col bg-white">
      <header className="frame flex h-16 shrink-0 items-center justify-between">
        <Link href="/" className="font-display text-3xl">
          Popsule
        </Link>
        <span className="inline-flex items-center gap-2 text-base text-muted">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
            <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
            <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
          </svg>
          Secure checkout
        </span>
      </header>
      <div className="frame flex flex-1 flex-col pt-6">
        <CheckoutClient />
      </div>
    </main>
  );
}
