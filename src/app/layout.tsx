import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, League_Spartan, Urbanist } from "next/font/google";
import AppShell from "@/components/AppShell";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// Type system: League Spartan headlines, DM Serif Display italic accents,
// Urbanist for reading. See the hierarchy notes in globals.css.
const spartan = League_Spartan({ subsets: ["latin"], variable: "--font-spartan" });
const dmSerif = DM_Serif_Display({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-dm-serif" });
const urbanist = Urbanist({ style: ["normal", "italic"], subsets: ["latin"], variable: "--font-urbanist" });

const description =
  "Build your own supplement formula in a frosted glass jar you keep, printed with your name and refilled every month in a metal canister. Design it in 3D, in real time.";

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: { default: "Popsule · One jar for life, refills by the month.", template: "%s · Popsule" },
  description,
  applicationName: "Popsule",
  openGraph: { type: "website", siteName: "Popsule", title: "Popsule · One jar for life, refills by the month.", description, url: "/" },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = { themeColor: "#ffffff" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${spartan.variable} ${dmSerif.variable} ${urbanist.variable} antialiased`}>
      <body className="min-h-full">
        <a
          href="#main"
          className="fixed left-4 top-4 z-[110] -translate-y-24 rounded-full bg-graphite px-5 py-3 text-lg text-white transition-transform focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
