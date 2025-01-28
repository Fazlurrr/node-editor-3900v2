import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Maintain alias for cleaner imports
    },
  },
  build: {
    outDir: "dist", // Ensure the output matches Azure Static Web App configuration
    sourcemap: true, // Useful for debugging in production builds
    chunkSizeWarningLimit: 500, // Adjust chunk size warning limit
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            // Split dependencies into separate chunks for optimization
            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0];
          }
        },
      },
    },
  },
});
