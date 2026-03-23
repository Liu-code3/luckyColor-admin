import type { Page } from '@playwright/test';

export const FRONTEND_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:9900';
export const BACKEND_URL = process.env.PLAYWRIGHT_API_URL || 'http://127.0.0.1:3001';
export const LOGIN_USERNAME = process.env.PLAYWRIGHT_LOGIN_USERNAME || 'admin';
export const LOGIN_PASSWORD = process.env.PLAYWRIGHT_LOGIN_PASSWORD || '123456';

export interface PageDiagnostics {
  consoleErrors: string[];
  pageErrors: string[];
  httpErrors: string[];
}

export function createDiagnostics(): PageDiagnostics {
  return {
    consoleErrors: [],
    pageErrors: [],
    httpErrors: []
  };
}

export function attachDiagnostics(page: Page, bucket: PageDiagnostics) {
  page.on('pageerror', (error) => {
    bucket.pageErrors.push(error.message);
  });

  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error' && !text.includes('ERR_CONNECTION_CLOSED'))
      bucket.consoleErrors.push(text);
  });

  page.on('response', (response) => {
    const url = response.url();
    const tracked = url.startsWith(FRONTEND_URL) || url.startsWith(BACKEND_URL);
    const ignored = url.includes('favicon.ico');

    if (tracked && !ignored && response.status() >= 400)
      bucket.httpErrors.push(`${response.status()} ${url}`);
  });
}

export async function loginAsAdmin(page: Page) {
  await page.addInitScript(() => {
    Math.random = () => 0.5;
  });

  await page.goto(`${FRONTEND_URL}/login`);
  await page.locator('input').first().fill(LOGIN_USERNAME);
  await page.locator('input').nth(1).fill(LOGIN_PASSWORD);
  await page.getByRole('button', { name: /登录/ }).click();
  await page.locator('.verify-content').waitFor({ state: 'visible' });
  await page.waitForTimeout(1200);

  const track = await page.locator('.slider-track').boundingBox();
  const button = await page.locator('.slider-button').boundingBox();

  if (!track || !button)
    throw new Error('slider not found');

  const maxX = track.width - button.width;
  const progress = (360 - 150) / 360;
  const startX = button.x + button.width / 2;
  const startY = button.y + button.height / 2;
  const endX = track.x + button.width / 2 + maxX * progress;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, startY, { steps: 20 });
  await page.mouse.up();

  await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
  await page.waitForLoadState('networkidle');
}

export function assertNoDiagnostics(diagnostics: PageDiagnostics) {
  if (diagnostics.consoleErrors.length || diagnostics.pageErrors.length || diagnostics.httpErrors.length)
    throw new Error(JSON.stringify(diagnostics, null, 2));
}
