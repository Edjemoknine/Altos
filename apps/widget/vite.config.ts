import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    lib: {
      entry: "./src/widget-entry.tsx",
      name: "AiSupportWidget",
      fileName: "widget",
      formats: ["iife"],
    },
  },
});
