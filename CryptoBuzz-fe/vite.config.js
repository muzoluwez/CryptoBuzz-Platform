import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5175,
    allowedHosts: ["localhost", "127.0.0.1", "0.0.0.0", "::1"],
  },
  plugins: [react(), tailwindcss()],
  // Using env var for flexibility, defaulting to "/" as requested
  base: process.env.VITE_BASE_URL || "/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
      "@context": fileURLToPath(new URL("./src/context", import.meta.url)),
      "@hooks": fileURLToPath(new URL("./src/hooks", import.meta.url)),
      "@store": fileURLToPath(new URL("./src/store", import.meta.url)),
      "@config": fileURLToPath(new URL("./src/config", import.meta.url)),
      "@lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
    outDir: "dist", // Azure looks for this folder by default
  },
});
