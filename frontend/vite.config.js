import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      strategies: "generateSW",
      injectRegister: "auto",
      manifest: {
        name: "Campus Lost",
        short_name: "CampusLost",
        description: "Lost something on campus? Find it here.",
        theme_color: "#111827",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
        importScripts: ["./firebase-messaging-sw.js"],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkOnly",
            options: { cacheName: "supabase-api" }
          }
        ],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//]
      },
      devOptions: {
        enabled: false
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react") || id.includes("scheduler")) return "vendor-react";
          if (id.includes("@supabase")) return "vendor-supabase";
          if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
          if (id.includes("gsap")) return "vendor-motion";
          if (id.includes("socket.io")) return "vendor-realtime";
          if (id.includes("axios") || id.includes("date-fns") || id.includes("zustand") || id.includes("zod")) return "vendor-utils";
          return "vendor";
        }
      }
    }
  }
});
