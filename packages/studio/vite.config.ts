import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import electron from 'vite-plugin-electron';
import path from 'node:path';

export default defineConfig({
  plugins: [
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron/electron',
            rollupOptions: {
              external: ['electron', 'chokidar'],
            },
          },
        },
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload();
        },
        vite: {
          build: {
            outDir: 'dist-electron/electron',
            sourcemap: true,
            minify: false,
            lib: {
              entry: 'electron/preload.ts',
              formats: ['cjs'],
              fileName: () => 'preload.js',
            },
            rollupOptions: {
              external: ['electron', 'electron/preload'],
            },
          },
        },
      },
      {
        entry: 'electron/python-bridge.ts',
        vite: {
          build: {
            outDir: 'dist-electron/electron',
            rollupOptions: {
              external: ['child_process', 'electron'],
            },
          },
        },
      },
    ]),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext',
  },
  server: {
    port: 5173,
    strictPort: true,
    host: '127.0.0.1',
  },
});
