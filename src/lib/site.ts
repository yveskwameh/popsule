// The public address, for metadata, the sitemap and share links. On Vercel the
// production domain is provided at build time; set NEXT_PUBLIC_SITE_URL to
// override it (for example with a custom domain).
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
);
