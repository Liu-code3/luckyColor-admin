import { expect, test } from '@playwright/test';
import { FRONTEND_URL } from '../helpers/admin';

test('登录页不再出现 Icon 组件解析 warning', async ({ page }) => {
  const iconWarnings: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() !== 'warning') {
      return;
    }

    const text = msg.text();
    if (text.includes('Failed to resolve component: Icon')) {
      iconWarnings.push(text);
    }
  });

  await page.goto(`${FRONTEND_URL}/login`);
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: /进入工作台|Enter workspace/ })).toBeVisible();
  expect(iconWarnings).toEqual([]);
});
