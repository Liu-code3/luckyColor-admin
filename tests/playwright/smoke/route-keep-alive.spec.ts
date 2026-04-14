import { expect, test } from '@playwright/test';
import {
  assertNoDiagnostics,
  attachDiagnostics,
  createDiagnostics,
  loginAsAdmin
} from '../helpers/admin';

test('keepAlive 路由在页面切换后保留状态', async ({ page }) => {
  const diagnostics = createDiagnostics();
  attachDiagnostics(page, diagnostics);

  await loginAsAdmin(page);
  await page.getByRole('menuitem', { name: '系统管理' }).click();
  await page.getByRole('menuitem', { name: '菜单管理' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.n-data-table')).toBeVisible();

  const keyword = `keepalive-${Date.now()}`;
  const menuSearchInput = page.locator('.toolbar input').first();
  await menuSearchInput.fill(keyword);
  await expect(menuSearchInput).toHaveValue(keyword);

  await page.getByRole('menuitem', { name: '角色管理' }).click();
  await page.waitForURL(/\/systemManagement\/system\/role$/);
  await expect(page.getByRole('button', { name: '新增角色' })).toBeVisible();

  await page.getByRole('menuitem', { name: '菜单管理' }).click();
  await page.waitForURL(/\/systemManagement\/system\/menu$/);
  await expect(page.locator('.n-data-table')).toBeVisible();
  await expect(page.locator('.toolbar input').first()).toHaveValue(keyword);

  assertNoDiagnostics(diagnostics);
});
