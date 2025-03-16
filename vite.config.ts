
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Polyfill for crypto.getRandomValues
if (!globalThis.crypto) {
  // @ts-ignore - Ignoring type issues with the polyfill implementation
  globalThis.crypto = {};
}
if (!globalThis.crypto.getRandomValues) {
  // @ts-ignore - Completely ignoring type checking for this polyfill function
  globalThis.crypto.getRandomValues = function(array) {
    const bytes = require('crypto').randomBytes(array.length);
    const uint8Array = new Uint8Array(bytes);
    for (let i = 0; i < array.length; i++) {
      array[i] = uint8Array[i];
    }
    return array;
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
    // Skip lovable-tagger completely since it's causing issues with Node.js 16
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
