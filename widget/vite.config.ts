import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: "src/widget.tsx",
      name: "MassyWidget",
      fileName: "widget",
      formats: ["iife"],
    },
    rollupOptions: {
      external: [],
      output: {
        inlineDynamicImports: true,
      },
    },
    outDir: "../public/widget",
    emptyOutDir: true,
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});
