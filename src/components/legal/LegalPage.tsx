import type { ReactNode } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";

export type Section = { id: string; title: string; tag?: string; body: ReactNode }; // tag: one or two words for the scrollbar

// Privacy and Terms: a contents list beside readable text, same frame and
// type as the rest of the site.
export default function LegalPage({ eyebrow, title, intro, updated, sections }: { eyebrow: string; title: string; intro: string; updated: string; sections: Section[] }) {
  return (
    <main id="main" className="min-h-dvh bg-white">
      <header className="frame flex h-16 items-center justify-between">
        <Link href="/" className="font-display text-3xl">
          Popsule
        </Link>
        <span className="flex items-center gap-4">
          <Link href="/" className="text-lg text-muted hover:text-graphite">
            Back to the shop
          </Link>
          <ThemeToggle />
        </span>
      </header>

      <div className="frame pb-24 pt-10 md:pt-16">
        <div className="max-w-3xl">
          <p className="text-lg italic text-muted">{eyebrow}</p>
          <h1 className="font-display text-5xl leading-none md:text-7xl">{title}</h1>
          <p className="mt-6 text-xl leading-relaxed text-muted">{intro}</p>
          <p className="mt-4 text-base text-muted">Last updated {updated}</p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-12 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-16">
          <nav aria-label="On this page" className="md:sticky md:top-8 md:self-start">
            <p className="text-base text-muted">On this page</p>
            <ol className="mt-3 flex flex-col gap-1.5 text-lg">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="hover:text-muted">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="flex max-w-2xl flex-col gap-12">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} data-section={s.tag ?? s.title} className="scroll-mt-8">
                <h2 className="flex items-baseline gap-3 font-display text-3xl leading-tight">
                  <span className="text-lg text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </h2>
                <div className="legal mt-4 flex flex-col gap-4 text-lg leading-relaxed text-graphite/85">{s.body}</div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
