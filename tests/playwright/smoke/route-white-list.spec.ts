import { expect, test } from '@playwright/test';
import { FRONTEND_URL } from '../helpers/admin';

test('未登录访问不存在页面时保留在 404 白名单路由', async ({ page }) => {
  const missingPath = '/__missing_route_for_white_list__';

  await page.goto(`${FRONTEND_URL}${missingPath}`);
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveURL(new RegExp(`${missingPath}$`));
  await expect(page.getByText('404 资源不存在')).toBeVisible();
  await expect(page).not.toHaveURL(/\/login$/);
});
