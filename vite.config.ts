import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

function normalizeBasePath(raw?: string): string {
  const value = raw?.trim() || '/verellis-watches/';
  const withLeading = value.startsWith('/') ? value : `/${value}`;
  return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, '');
  const base = normalizeBasePath(process.env.VITE_BASE ?? env.VITE_BASE);

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      // Ensures static public/ font and manifest paths honor VITE_BASE in both dev and build.
      {
        name: 'verellis-base-path-assets',
        transformIndexHtml: {
          order: 'post',
          handler(html: string) {
            return html.replace(/https:\/\/verellis-horology\.example\//g, base);
          },
        },
        transform(code: string, id: string) {
          if (id.split('?')[0].endsWith('/src/index.css')) {
            return {
              code: code
                .replace(/url\("\/fonts\//g, `url("${base}fonts/`)
                .replace(/url\('\/fonts\//g, `url('${base}fonts/`),
              map: null,
            };
          }
          return null;
        },
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(import.meta.dirname, 'dist');
          const manifestPath = path.resolve(distDir, 'site.webmanifest');
          if (fs.existsSync(manifestPath)) {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as {
              start_url?: string;
              icons?: Array<{ src: string; sizes: string; type: string }>;
            };
            manifest.start_url = base;
            if (Array.isArray(manifest.icons)) {
              manifest.icons = manifest.icons.map((icon) => ({
                ...icon,
                src: `${base}${icon.src.replace(/^\/+/, '')}`,
              }));
            }
            fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
          }
        },
      },
      // Copies src/assets into dist/ so any root-relative URLs still resolve
      // in production builds.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const rootDir = import.meta.dirname;
          const distDir = path.resolve(rootDir, 'dist');
          const srcAssets = path.resolve(rootDir, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, { recursive: true, force: true });
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      rolldownOptions: {
        output: {
          manualChunks(id: string) {
            if (id.includes('/node_modules/three/')) {
              return 'three-vendor';
            }
            if (id.includes('/node_modules/gsap/') || id.includes('/node_modules/lenis/')) {
              return 'motion-vendor';
            }
            if (
              id.includes('/node_modules/react/') ||
              id.includes('/node_modules/react-dom/') ||
              id.includes('/node_modules/react-router')
            ) {
              return 'react-vendor';
            }
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
