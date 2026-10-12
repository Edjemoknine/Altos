import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
/* import cssInjectedByJsPlugin from "vite-plugin-css-injected-by-js"; // Optional: injects CSS directly into JS
 */
export default defineConfig({
  plugins: [
    react(),
    /*     cssInjectedByJsPlugin()
     */
  ],
  build: {
    lib: {
      entry: "./src/widget-entry.tsx",
      name: "AiSupportWidget",
      fileName: "widget",
      formats: ["iife"], // Immediately Invoked Function Expression for script tags
    },
    rollupOptions: {
      external: [], // Bundle everything self-contained
      output: {
        globals: {},
      },
    },
  },
});
