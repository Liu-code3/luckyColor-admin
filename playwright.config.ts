import { defineConfig } from '@playwright/test';

const channel = process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined);

export default defineConfig({
  testDir: './tests/playwright',
  timeout: 120000,
  expect: {
    timeout: 10000
  },
  reporter: 'line',
  outputDir: 'test-results',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:9900',
    headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        ...(channel ? { channel } : {})
      }
    }
  ],
  webServer: {
    command: 'pnpm dev --host 127.0.0.1 --port 9900',
    url: 'http://127.0.0.1:9900/login',
    reuseExistingServer: true,
    timeout: 120000
  }
});
