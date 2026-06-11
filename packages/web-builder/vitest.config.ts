import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts', 'scripts/**/*.ts', 'types.ts'],
      exclude: ['**/*.test.ts', '**/__tests__/**'],
      reportsDirectory: './coverage'
    }
  }
});
