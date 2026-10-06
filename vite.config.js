import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },
});
