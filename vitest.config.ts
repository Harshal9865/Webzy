import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@webzy/core/server': path.resolve(__dirname, 'packages/core/src/server.ts'),
      '@webzy/core': path.resolve(__dirname, 'packages/core/src/index.ts'),
      '@webzy/themes': path.resolve(__dirname, 'packages/themes/src/index.ts'),
      '@webzy/jobs': path.resolve(__dirname, 'packages/jobs/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['packages/**/*.test.ts', 'apps/**/*.test.ts', 'infra/**/*.test.ts'],
  },
});
