import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Relative base ensures assets and data load properly both on localhost
  // and when deployed to any GitHub Pages repository path.
  base: process.env.VITE_BASE || './',

  // Build output configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
  },

  // Dev server configuration
  server: {
    port: 5173,
    host: '127.0.0.1',
    open: false,
  },
});
