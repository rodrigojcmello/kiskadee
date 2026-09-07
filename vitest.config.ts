import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./packages/showcase', import.meta.url)) } },
  test: {
    exclude: ['**/dist/**', '**/node_modules/**']
  }
});
