import { defineConfig } from '@playwright/experimental-ct-react';

export default defineConfig({
  testDir: './tests/component',
  use: {
    ctPort: 3100,
  },
});

