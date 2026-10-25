// The public address, for metadata, the sitemap and share links. On Vercel the
// production domain is provided at build time; set NEXT_PUBLIC_SITE_URL to
// override it (for example with a custom domain).
// The 3D model every jar is built from. The layout starts downloading it with
// the page, so it doesn't wait for the 3D code to ask for it.
export const modelUrl = "/models/popsule.glb";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000"),
);
