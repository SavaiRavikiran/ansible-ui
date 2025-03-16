
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Polyfill for crypto.getRandomValues
if (!globalThis.crypto) {
  // @ts-ignore
  globalThis.crypto = {};
}
if (!globalThis.crypto.getRandomValues) {
  // @ts-ignore - Ignoring type issues with the polyfill implementation
  globalThis.crypto.getRandomValues = (arr) => {
    const bytes = require('crypto').randomBytes(arr.length);
    arr.set(new Uint8Array(bytes));
    return arr;
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Only use componentTagger in development if available
    mode === 'development' && 
    (() => {
      try {
        const { componentTagger } = require("lovable-tagger");
        return componentTagger();
      } catch (e) {
        console.warn("Could not load lovable-tagger, skipping...");
        return null;
      }
    })(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
