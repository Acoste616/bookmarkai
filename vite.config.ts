import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';
// Ensure runtimeErrorOverlay is installed in the root package.json or remove if not used.
// import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    // runtimeErrorOverlay(), // Uncomment if installed and desired
    // ...(process.env.NODE_ENV !== "production" &&
    // process.env.REPL_ID !== undefined
    //   ? [
    //       await import("@replit/vite-plugin-cartographer").then((m) => // Ensure this is installed or remove
    //         m.cartographer(),
    //       ),
    //     ]
    //   : []),
  ],
  // Set the project root to be the 'frontend' directory
  root: path.resolve(__dirname, "frontend"),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Define @db and @shared if you create 'db' and 'shared' folders at the root
      // "@db": path.resolve(__dirname, "db"),
      // "@shared": path.resolve(__dirname, "shared"),
      // Define @assets if you create an 'attached_assets' folder at the root
      // "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  build: {
    // Output directory relative to the workspace root
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      // Input files are now relative to the 'root' option (frontend/)
      // So, Vite will look for 'frontend/index.html' and 'frontend/src/service-worker.ts'
      input: {
        main: path.resolve(__dirname, "frontend/index.html"),
        "service-worker": path.resolve(__dirname, "frontend/src/service-worker.ts"),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === "service-worker" ? "[name].js" : "assets/[name]-[hash].js";
        },
      },
    },
  },
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:5001", // Proxy to backend
        changeOrigin: true,
      },
    },
  },
}); 