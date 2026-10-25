import type { CSSProperties } from "react";
import Link from "next/link";
import HomeStory from "@/components/home/HomeStory";
import NameTeaser from "@/components/home/NameTeaser";
import HowItWorks from "@/components/home/HowItWorks";
import RangeShelf from "@/components/home/RangeShelf";
import PriceBuilder from "@/components/home/PriceBuilder";
import Footer from "@/components/home/Footer";
import Faq from "@/components/home/Faq";
import BagButton from "@/components/ui/BagButton";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { products } from "@/lib/brand";
import { encodeSnapshot, priceOf, startingSnapshot } from "@/lib/lab";
import { siteUrl } from "@/lib/site";

// Structured data for search engines: the brand, the site and the four
// starting formulas with their lowest monthly price.
const url = (path: string) => new URL(path, siteUrl).href;
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", "@id": url("/#org"), name: "Popsule", url: url("/"), logo: url("/icon.svg") },
    { "@type": "WebSite", "@id": url("/#site"), name: "Popsule", url: url("/"), publisher: { "@id": url("/#org") } },
    ...products.map((p) => ({
      "@type": "Product",
      name: `${p.name} supplement refill`,
      description: `A ${p.goal.toLowerCase()} formula with ${p.ingredients.join(" and ").toLowerCase()}, in a frosted glass jar printed with your name and refilled monthly.`,
      brand: { "@id": url("/#org") },
      category: "Dietary supplements",
      image: url("/opengraph-image.jpg"),
      url: url(`/build?d=${encodeSnapshot(startingSnapshot(p.id))}`),
      offers: {
        "@type": "Offer",
        price: priceOf({ size: 30, goals: [p.id], metal: "satin" }).total,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: url(`/build?d=${encodeSnapshot(startingSnapshot(p.id))}`),
      },
    })),
  ],
};

export default function Home() {
  return (
    <main id="main">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="intro-fade fixed inset-x-0 top-0 z-20 flex items-center justify-between frame bg-mist/85 py-4 backdrop-blur-sm">
        <span className="intro-drop font-display text-3xl" style={{ "--d": "0.1s" } as CSSProperties}>
          Popsule
        </span>
        <nav className="flex items-center gap-6 text-lg">
          <a href="#range" className="intro-drop hidden hover:underline sm:inline" style={{ "--d": "0.18s" } as CSSProperties}>
            The range
          </a>
          <a href="#how" className="intro-drop hidden hover:underline sm:inline" style={{ "--d": "0.24s" } as CSSProperties}>
            How it works
          </a>
          <Link href="/build" data-magnetic className="intro-drop rounded-full bg-cta px-5 py-2.5 text-on-cta hover:bg-cta-hover" style={{ "--d": "0.3s" } as CSSProperties}>
            Design yours
          </Link>
          <span className="-ml-2 flex items-center gap-1">
            <ThemeToggle className="intro-drop" style={{ "--d": "0.36s" } as CSSProperties} />
            <BagButton className="intro-drop" style={{ "--d": "0.42s" } as CSSProperties} />
          </span>
        </nav>
      </header>

      <HomeStory />

      <NameTeaser />

      <HowItWorks />

      <RangeShelf />

      <PriceBuilder />

      <section id="questions" data-section="Questions" className="frame grid grid-cols-1 gap-10 py-24 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:py-32">
        <h2 className="font-display text-5xl md:text-6xl">Questions</h2>
        <Faq />
      </section>

      <Footer />
    </main>
  );
}
