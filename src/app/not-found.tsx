import Link from "next/link";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <main id="main" className="frame flex min-h-dvh flex-col bg-white">
      <header className="flex h-16 shrink-0 items-center">
        <Link href="/" className="font-display text-3xl">
          Popsule
        </Link>
      </header>
      <div className="m-auto flex flex-col items-center gap-5 pb-16 text-center">
        <p className="text-lg italic text-muted">Error 404</p>
        <h1 className="font-display text-5xl leading-none md:text-7xl">
          This shelf is <em>empty.</em>
        </h1>
        <p className="max-w-md text-lg text-muted">The page you were after isn&apos;t here. Your jar might be, though.</p>
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Link href="/build" data-magnetic className="inline-flex h-12 items-center rounded-full bg-cta px-7 text-lg text-on-cta hover:bg-cta-hover">
            Build your jar
          </Link>
          <Link href="/" data-magnetic className="inline-flex h-12 items-center rounded-full border border-graphite px-7 text-lg hover:bg-mist">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
