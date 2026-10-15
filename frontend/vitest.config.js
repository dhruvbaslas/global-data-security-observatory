import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use jsdom to simulate browser APIs in tests
    environment: 'jsdom',

    // Global test setup file (mocks, cleanup, etc.)
    setupFiles: ['./src/__tests__/setup.js'],

    // Enable global test APIs (describe, it, expect) without imports
    globals: true,

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/__tests__/**', 'src/main.jsx'],
    },

    // File patterns to include as tests
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
});
