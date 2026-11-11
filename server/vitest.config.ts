import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    fileParallelism: false,
    include: ['tests/**/*.test.ts', 'tests/*.test.ts', 'src/**/*.test.ts'],
    env: {
      NODE_ENV: 'test',
      DATABASE_URL: 'file:./test.db',
    },
  },
});

