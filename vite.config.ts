
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Ensure Node.js built-ins are not bundled
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Create separate chunks for major dependencies
          if (id.includes('node_modules')) {
            // Extract major package name
            const packageName = id.toString().split('node_modules/')[1].split('/')[0];
            // Group packages by category to reduce chunk count
            if (['react', 'react-dom', 'react-router-dom'].includes(packageName)) {
              return 'vendor-react';
            }
            if (['@tanstack', 'recharts', 'framer-motion'].includes(packageName)) {
              return 'vendor-data-viz';
            }
            if (packageName.startsWith('@radix-ui')) {
              return 'vendor-radix';
            }
            return `vendor-${packageName}`;
          }
        }
      }
    }
  }
}));
