import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  server: {
    port: 3001,
    open: true
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    minify: 'esbuild'
  }
});
