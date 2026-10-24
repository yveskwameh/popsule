import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: new URL("/", siteUrl).href, changeFrequency: "monthly", priority: 1 },
    { url: new URL("/build", siteUrl).href, changeFrequency: "monthly", priority: 0.8 },
    { url: new URL("/privacy", siteUrl).href, changeFrequency: "yearly", priority: 0.2 },
    { url: new URL("/terms", siteUrl).href, changeFrequency: "yearly", priority: 0.2 },
  ];
}
