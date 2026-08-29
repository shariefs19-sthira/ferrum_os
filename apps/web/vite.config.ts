import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsx: 'transform', // Explicitly tell esbuild to transform JSX
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment',
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    css: true,
  },
});