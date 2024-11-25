import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/cn-editor.ts',
      name: 'CnEditor',
      fileName: (format) => `cn-editor.${format}.js`,
    },
    rollupOptions: {
      external: ['lit', 'turndown'],
      output: {
        globals: {
          lit: 'lit',
          turndown: 'TurndownService',
        },
      },
    },
  },
});
