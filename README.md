# Popsule

One jar for life, refills by the month. A supplement shop where you build your own formula and see your jar in 3D, in real time: a frosted glass jar printed with your name, and the metal refill that follows it every month.

Built with Next.js 16, React Three Fiber and drei, GSAP with Lenis, and Zustand.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. If styles look out of date after pulling, clear the cache with `rm -rf .next` and start again.

## Pages

- `/` home: a pinned scroll story (anatomy, refill, a year of refills, the range), then "Make it yours", how it works, the range, pricing, questions and the footer.
- `/build` Build your jar: every choice on one screen beside the 3D jar. The design lives in the URL (`?d=`), so any link is a share link. `/lab` redirects here.
- `/checkout` and `/checkout/success`: the bag, a one-page checkout and the confirmation. Orders are placed in the browser and kept in localStorage; no payment is taken and no card details are asked for.

## 3D

- One fixed WebGL canvas for the whole site (`src/components/canvas/Scene.tsx`); each stage is a drei `<View>` placed in the page.
- The jar, refill and capsules are modelled in Blender by `blender/models.py` and compressed with meshopt (both commands are at the top of that file). `src/components/product/model.ts` unpacks the meshes once on load.
- Every jar can be handled: lean, peek, spin and open (`src/components/product/Handled.tsx`).

## Deploy to Vercel

No environment variables are needed. Import the repository in Vercel (framework preset: Next.js) and deploy. Metadata, the sitemap and the share image use the production domain Vercel provides; set `NEXT_PUBLIC_SITE_URL` to use a custom domain instead.

## Checks

```bash
npm run lint
npm run build
```
