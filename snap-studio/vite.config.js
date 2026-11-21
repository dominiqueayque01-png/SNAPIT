import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE_PATH || "/SNAPIT/",
  resolve: {
    dedupe: ["react", "react-dom"]
  },
  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true
      },
      "/uploads": {
        target: "http://localhost:3001",
        changeOrigin: true
      },
      "/s": {
        target: "http://localhost:3001",
        changeOrigin: true
      }
    }
  }
});
