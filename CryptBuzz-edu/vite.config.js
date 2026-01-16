import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "tailwindcss";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5174,
    allowedHosts: ["edu-fsasavghftf7h2da.westus2-01.azurewebsites.net"],
  },
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  base: "/",
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
      "@context": fileURLToPath(new URL("./src/context", import.meta.url)),
      "@hooks": fileURLToPath(new URL("./src/hooks", import.meta.url)),
      "@pages": fileURLToPath(new URL("./src/pages", import.meta.url)),
      "@utils": fileURLToPath(new URL("./src/utils", import.meta.url)),
      "@assets": fileURLToPath(new URL("./src/assets", import.meta.url)),
      "@services": fileURLToPath(new URL("./src/services", import.meta.url)),
      "@store": fileURLToPath(new URL("./src/store", import.meta.url)),
      "@types": fileURLToPath(new URL("./src/types", import.meta.url)),
      "@config": fileURLToPath(new URL("./src/config", import.meta.url)),
      "@lib": fileURLToPath(new URL("./src/lib", import.meta.url)),
      "@mock": fileURLToPath(new URL("./src/mock", import.meta.url)),
      "@tests": fileURLToPath(new URL("./src/tests", import.meta.url)),

    },
  },
  build: {
    chunkSizeWarningLimit: 3000,
    outDir: "dist", // Azure looks for this folder by default
  },
});
