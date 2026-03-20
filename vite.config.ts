import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  base: "/", // ✅ IMPORTANTE para Capacitor

  server: {
    host: true,
    port: 8080,
    hmr: {
      overlay: false,
    },
  },

  plugins: [
    react(),

    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico"],

      manifest: {
        name: "Rabbit",
        short_name: "Rabbit",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#16a34a",

        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },

      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst"
          },
          {
            urlPattern: ({ request }) =>
              request.destination === "script" ||
              request.destination === "style",
            handler: "CacheFirst"
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst"
          }
        ]
      }
    })
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
