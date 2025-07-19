import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          charts: ['recharts'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod']
        },
        // Optimize for memory usage
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    sourcemap: false,
    minify: 'terser',
    target: 'es2020',
    // Memory optimization settings
    chunkSizeWarningLimit: 1000,
    // Reduce memory usage during build
    reportCompressedSize: false,
    // Disable source maps to save memory
    cssCodeSplit: false,
    // Disable CSS splitting to save memory
    assetsInlineLimit: 4096,
    // Disable minification temporarily to save memory
    minify: false
  },
  // Optimize for low memory environments
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select']
  },
  // Disable features that consume memory
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});
