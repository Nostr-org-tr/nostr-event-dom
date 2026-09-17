import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  root: process.env.NODE_ENV === 'test' ? '.' : undefined,
  plugins: [
    dts({
      rollupTypes: true,
      include: ['src/**/*.ts']
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'NostrEvent',
      fileName: (format) => {
        if (format === 'es') return 'nostr-event.js';
        if (format === 'iife') return 'nostr-event.global.js';
        return `nostr-event.${format}.cjs`;
      },
      formats: ['es', 'iife', 'umd']
    },
    rollupOptions: {
      output: {
        exports: 'named'
      }
    },
    sourcemap: true,
    minify: 'esbuild'
  },
  server: {
    port: 3000,
    open: true
  }
});
