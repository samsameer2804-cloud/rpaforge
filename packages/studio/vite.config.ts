import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import electron from 'vite-plugin-electron';
import path from 'node:path';
import fs from 'node:fs';

function copyPublicPlugin() {
  return {
    name: 'copy-public',
    closeBundle() {
      const publicDir = path.resolve(__dirname, 'public');
      const distDir = path.resolve(__dirname, 'dist');
      
      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }
      
      if (fs.existsSync(publicDir)) {
        fs.readdirSync(publicDir).forEach(file => {
          fs.copyFileSync(
            path.join(publicDir, file),
            path.join(distDir, file)
          );
        });
      }
    }
  };
}

export default defineConfig({
  plugins: [
    copyPublicPlugin(),
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
            rollupOptions: {
              external: ['electron'],
              output: {
                format: 'cjs',
                inlineDynamicImports: true,
              },
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
  publicDir: 'public',
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
    copyPublicDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
    host: '127.0.0.1',
  },
});
