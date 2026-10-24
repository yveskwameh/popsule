import Link from "next/link";
import HomeStory from "@/components/home/HomeStory";
import NameTeaser from "@/components/home/NameTeaser";
import HowItWorks from "@/components/home/HowItWorks";
import RangeShelf from "@/components/home/RangeShelf";
import PriceBuilder from "@/components/home/PriceBuilder";
import Footer from "@/components/home/Footer";
import Faq from "@/components/home/Faq";
import BagButton from "@/components/ui/BagButton";

export default function Home() {
  return (
    <main id="main">
      <header className="fixed inset-x-0 top-0 z-20 flex items-center justify-between frame bg-mist/85 py-4 backdrop-blur-sm">
        <span className="font-display text-3xl">Popsule</span>
        <nav className="flex items-center gap-6 text-lg">
          <a href="#range" className="hidden hover:underline sm:inline">
            The range
          </a>
          <a href="#how" className="hidden hover:underline sm:inline">
            How it works
          </a>
          <Link href="/build" data-magnetic className="rounded-full bg-graphite px-5 py-2.5 text-white hover:bg-black">
            Design yours
          </Link>
          <BagButton className="-ml-2" />
        </nav>
      </header>

      <HomeStory />

      <NameTeaser />

      <HowItWorks />

      <RangeShelf />

      <PriceBuilder />

      <section id="questions" className="frame grid grid-cols-1 gap-10 py-24 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:py-32">
        <h2 className="font-display text-5xl md:text-6xl">Questions</h2>
        <Faq />
      </section>

      <Footer />
    </main>
  );
}
