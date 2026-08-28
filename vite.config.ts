import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  envPrefix: ["VITE_"],
  plugins: [
    react(), // Bundle analyzer - generates stats.html in dist/
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: "stats.html",
    }),
    cloudflare(),
  ],
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "src/app"),
      "@features": path.resolve(__dirname, "src/features"),
      "@shared": path.resolve(__dirname, "src/shared"),
    },
    dedupe: ["react", "react-dom"],
  },
  server: {
    // Respect an externally assigned port (e.g. tooling that sets PORT);
    // default to 3000 for plain `npm run dev`.
    port: Number(process.env.PORT) || 3000,
    host: true,
    watch: {
      // Native Windows file notifications avoid the constant CPU churn of a
      // 100 ms repository-wide polling loop. Opt in only for network/VM
      // filesystems that actually require polling.
      usePolling: process.env.VITE_USE_POLLING === "1",
      interval: 500,
    },
    hmr: {
      overlay: true,
      host: "localhost",
      protocol: "ws",
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Keep Vite's dynamic-import helper in a tiny neutral chunk. If
          // Rollup places it inside r3f-vendor, the entry must import that
          // chunk and phones eagerly download the whole Three.js graph.
          if (id.includes("vite/preload-helper")) {
            return "preload-runtime";
          }
          if (id.includes("node_modules")) {
            // Core React chunk
            if (
              /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)
            ) {
              return "react-vendor";
            }
            // xterm is heavy (~200KB) and only used in the Terminal app — isolate it
            if (id.includes("@xterm") || id.includes("xterm")) {
              return "xterm-vendor";
            }
            // @react-three/drei helpers — loaded with the 3D scene, separate from core three
            if (id.includes("@react-three")) {
              return "r3f-vendor";
            }
            // framer-motion is used by OS apps — lazy-loaded with them
            if (id.includes("framer-motion") || id.includes("popmotion")) {
              return "motion-vendor";
            }
            // lucide-react icons — small, load with OS apps
            if (id.includes("lucide-react")) {
              return "icons-vendor";
            }
            // Split Three.js into its own chunk
            if (id.includes("three")) {
              return "three-vendor";
            }
            // Let Rollup keep remaining packages with the route that owns
            // them. A catch-all vendor chunk couples unrelated mobile and
            // desktop dependencies and defeats the lazy layout boundary.
            return;
          }
        },
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    chunkSizeWarningLimit: 800, // three.js is ~741KB minified; expected for a 3D portfolio
    minify: "esbuild",
    target: "es2020",
    cssCodeSplit: true,
    // Better tree-shaking for smaller bundles
    modulePreload: { polyfill: false }, // Modern browsers support modulepreload natively
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
});
