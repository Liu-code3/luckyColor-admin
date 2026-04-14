import { defineConfig } from '@playwright/test';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const channel = process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'msedge' : undefined);
const currentFile = fileURLToPath(import.meta.url);
const projectRoot = dirname(currentFile);
const backendMode = process.env.PLAYWRIGHT_BACKEND_MODE || 'springboot';
const backendPort = process.env.PLAYWRIGHT_API_PORT || '3001';
const backendBaseUrl = process.env.PLAYWRIGHT_API_URL || `http://127.0.0.1:${backendPort}`;
const backendRoot = process.env.PLAYWRIGHT_BACKEND_ROOT
  || resolve(projectRoot, '..', backendMode === 'springboot' ? 'luckyColor-admin-springboot' : 'luckyColor-admin-serve');

const backendServer = backendMode === 'springboot'
  ? {
      command: 'sh "mvnw" spring-boot:run',
      cwd: backendRoot,
      url: `${backendBaseUrl}/api/docs`,
      reuseExistingServer: true,
      timeout: 180000
    }
  : {
      command: 'pnpm dev',
      cwd: backendRoot,
      url: `${backendBaseUrl}/docs`,
      reuseExistingServer: true,
      timeout: 120000
    };

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
  webServer: [
    ...(backendMode === 'external' ? [] : [backendServer]),
    {
      command: 'pnpm dev --host 127.0.0.1 --port 9900',
      url: 'http://127.0.0.1:9900/login',
      reuseExistingServer: true,
      timeout: 120000
    }
  ]
});
