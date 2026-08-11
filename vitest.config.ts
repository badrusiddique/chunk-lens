import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      environmentOptions: {
        jsdom: { url: 'http://localhost' },
      },
      setupFiles: ['./src/test-setup.ts'],
      coverage: {
        provider: 'v8',
        include: ['src/lib/**'],
        thresholds: {
          statements: 90,
          branches: 90,
        },
      },
    },
  }),
);
