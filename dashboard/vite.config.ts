import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// `base` is set only at build time so local dev keeps serving at `/`.
// Production builds embed `/zhi-pay/` so assets resolve under the
// project-pages URL https://sardorallaberganov.github.io/zhi-pay/.
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/zhi-pay/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
}));
