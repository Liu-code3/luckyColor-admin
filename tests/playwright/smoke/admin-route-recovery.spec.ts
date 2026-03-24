import { expect, test } from '@playwright/test';
import {
  assertNoDiagnostics,
  attachDiagnostics,
  createDiagnostics,
  loginAsAdmin
} from '../helpers/admin';

test('动态路由在页面刷新后可恢复', async ({ page }) => {
  const diagnostics = createDiagnostics();
  attachDiagnostics(page, diagnostics);

  await loginAsAdmin(page);
  await page.goto('/systemManagement/system/menu');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.n-data-table')).toBeVisible();

  await page.reload();
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveURL(/\/systemManagement\/system\/menu$/);
  await expect(page.locator('.n-data-table')).toBeVisible();
  await expect(page.getByRole('button', { name: '新增菜单' })).toBeVisible();

  assertNoDiagnostics(diagnostics);
});
