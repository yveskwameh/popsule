import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, League_Spartan, Urbanist } from "next/font/google";
import AppShell from "@/components/AppShell";
import { preload } from "react-dom";
import { modelUrl, siteUrl } from "@/lib/site";
import { themeScript } from "@/lib/theme-script";
import { preloadScript } from "@/lib/preload-script";
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
  // Google Search Console ownership check for https://popsule.vercel.app.
  verification: { google: "KNuXOS850O6zdtNxo7hokx8y7WEXnuZ6WPqbDWoo9UQ" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#17181b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  // Fetch the model alongside the 3D code instead of after it.
  preload(modelUrl, { as: "fetch", crossOrigin: "anonymous" });
  return (
    <html lang="en" className={`${spartan.variable} ${dmSerif.variable} ${urbanist.variable} antialiased`} data-theme="light" suppressHydrationWarning>
      <head>
        {/* Sets the theme before the first paint, so dark mode never flashes light. */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {/* Decides before the first paint whether this visit shows the preloader. */}
        <script dangerouslySetInnerHTML={{ __html: preloadScript }} />
      </head>
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
