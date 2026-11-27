# VERELLIS

Architectural Swiss-inspired watch showcase and storefront built as a pure static web application with a scroll-driven 3D calibre assembly and interactive product viewer.

> **Sample Content Notice:** Testimonials, atelier stories, legal pages (Privacy Policy, Terms of Service, Shipping & Returns, Warranty & Care), newsletter/concierge form submissions, and the checkout flow are sample placeholder content for demonstration purposes. No real payments, orders, or server-side submissions take place.

## Tech Stack

- **React** & **TypeScript** — component UI, client-side routing (`react-router-dom`), and local cart state
- **Three.js** — procedural 3D watch model, brushed/polished PBR materials, studio lighting, and interactive viewer
- **GSAP** (ScrollTrigger) & **Lenis** — scroll-choreographed timepiece assembly and smooth scrolling
- **Tailwind CSS** & **Vite** — styling, route code-splitting, and static production bundling

## Running Locally

Install dependencies and start the Vite development server:

```bash
npm install
npm run dev
```

The app runs at `http://localhost:3000/verellis-watches/` by default (matching the default `VITE_BASE` path). To serve from `/` locally instead:

```bash
VITE_BASE=/ npm run dev
```

## Building for Production

Create a static production build in `dist/` (which also copies `dist/index.html` to `dist/404.html` so deep links work on GitHub Pages):

```bash
npm run build
```

Preview the production bundle locally:

```bash
npm run preview
```

## Changing the Base Path for a Custom Domain

By default, `vite.config.ts` reads `VITE_BASE` and falls back to `"/verellis-watches/"` for GitHub Pages project hosting (`https://<username>.github.io/verellis-watches/`).

If you configure a custom domain (or publish at the root of `<username>.github.io`):

1. Set `VITE_BASE=/` in `.env` or pass it when building:
   ```bash
   VITE_BASE=/ npm run build
   ```
2. Update `VITE_BASE` to `/` in `.github/workflows/deploy.yml` so automated GitHub Pages builds use the root base path.
