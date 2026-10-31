
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response:', proxyRes.statusCode, req.url);
          });
        }
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
          // Create a chunk for large dependencies
          if (id.includes('node_modules')) {
            // Extract major package name
            const packageName = id.toString().split('node_modules/')[1].split('/')[0];
            return `vendor-${packageName}`;
          }
        }
      },
      external: [
        // Node.js built-in modules that should not be bundled
        'child_process', 'fs', 'path', 'os', 'url'
      ]
    }
  }
}));
