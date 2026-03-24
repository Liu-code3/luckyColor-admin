import { expect, test } from '@playwright/test';
import {
  FRONTEND_URL,
  assertNoDiagnostics,
  attachDiagnostics,
  createDiagnostics,
  loginAsAdmin
} from '../helpers/admin';

test('外链菜单点击后打开新窗口并保持当前页不变', async ({ page }) => {
  const diagnostics = createDiagnostics();
  attachDiagnostics(page, diagnostics);

  await loginAsAdmin(page);
  await page.goto('/systemManagement/system/users');
  await page.waitForLoadState('networkidle');

  await page.evaluate((frontendUrl) => {
    const storageKey = 'AUTH_MENU_TREE';
    const menuTree = JSON.parse(localStorage.getItem(storageKey) || '[]');
    const systemMenu = menuTree.find((item: any) => item.path === '/systemManagement');
    if (!systemMenu || !Array.isArray(systemMenu.children)) {
      throw new Error('system menu not found');
    }

    const externalPath = `${frontendUrl}/login?from=external-menu`;
    const exists = systemMenu.children.some((item: any) => item.name === 'externalDocs');

    if (!exists) {
      systemMenu.children.push({
        pid: systemMenu.id,
        id: 999001,
        title: '外链文档',
        name: 'externalDocs',
        type: 2,
        path: externalPath,
        key: 'main_system_external_docs',
        icon: 'mdi:open-in-new',
        layout: '',
        isVisible: true,
        component: 'sys',
        meta: {
          type: 'link',
          url: externalPath
        }
      });
    }

    localStorage.setItem(storageKey, JSON.stringify(menuTree));
  }, FRONTEND_URL);

  await page.reload();
  await page.waitForLoadState('networkidle');

  await expect(page.locator('.n-menu')).toContainText('外链文档');

  const popupPromise = page.waitForEvent('popup');
  await page.locator('.n-menu').getByText('外链文档', { exact: true }).click();
  const popup = await popupPromise;

  await popup.waitForLoadState('domcontentloaded');
  expect(popup.url()).toBe(`${FRONTEND_URL}/login?from=external-menu`);
  await expect(page).toHaveURL(/\/systemManagement\/system\/users$/);

  assertNoDiagnostics(diagnostics);
});
