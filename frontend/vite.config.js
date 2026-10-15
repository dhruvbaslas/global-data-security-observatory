import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // When deploying to GitHub Pages, set the base path to the repo name.
  // The GITHUB_PAGES env var is set during CI/CD builds.
  base: process.env.GITHUB_PAGES ? '/Demo/' : '/',

  // Build output configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
  },

  // Dev server configuration
  server: {
    port: 5173,
    open: true,
  },
});
