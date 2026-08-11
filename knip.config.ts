import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['src/main.tsx', 'src/test-setup.ts'],
  project: ['src/**/*.{ts,tsx}'],
  ignoreDependencies: ['@testing-library/jest-dom'],
};

export default config;
