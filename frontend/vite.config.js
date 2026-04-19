import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-core": ["react", "react-dom", "react-router-dom"],
          data: ["@tanstack/react-query", "axios", "zustand"],
          markdown: ["react-markdown", "remark-gfm"],
          syntax: ["react-syntax-highlighter"],
          graph: ["react-force-graph-2d"],
          charts: ["recharts"],
          pdf: ["jspdf"]
        }
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true
      }
    }
  }
});
