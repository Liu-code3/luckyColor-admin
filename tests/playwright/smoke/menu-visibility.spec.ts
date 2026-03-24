import { expect, test } from '@playwright/test';
import {
  assertNoDiagnostics,
  attachDiagnostics,
  createDiagnostics,
  loginAsAdmin
} from '../helpers/admin';

test('隐藏菜单不会出现在导航中但路由仍可访问', async ({ page }) => {
  const diagnostics = createDiagnostics();
  attachDiagnostics(page, diagnostics);

  await loginAsAdmin(page);
  await page.locator('.modular_box').getByText('系统管理', { exact: true }).click();
  await expect(page.locator('.n-menu')).toContainText('字典管理');

  await page.evaluate(() => {
    const storageKey = 'AUTH_MENU_TREE';
    const menuTree = JSON.parse(localStorage.getItem(storageKey) || '[]');

    const hideTargetMenu = (items: any[]) => {
      items.forEach((item) => {
        if (item.path === '/systemManagement/system/dict') {
          item.isVisible = false;
        }

        if (Array.isArray(item.children)) {
          hideTargetMenu(item.children);
        }
      });
    };

    hideTargetMenu(menuTree);
    localStorage.setItem(storageKey, JSON.stringify(menuTree));
  });

  await page.goto('/systemManagement/system/users');
  await page.waitForLoadState('networkidle');
  await page.reload();
  await page.waitForLoadState('networkidle');

  await expect(page.locator('.n-menu')).not.toContainText('字典管理');

  await page.goto('/systemManagement/system/dict');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.n-tree')).toBeVisible();
  await expect(page.locator('.dict-table-card')).toBeVisible();

  assertNoDiagnostics(diagnostics);
});
