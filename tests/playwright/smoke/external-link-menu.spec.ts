import { expect, test } from '@playwright/test';
import {
  assertNoDiagnostics,
  attachDiagnostics,
  createDiagnostics,
  loginAsAdmin
} from '../helpers/admin';

test('外链菜单点击后打开新窗口并保持当前页不变', async ({ page }) => {
  const diagnostics = createDiagnostics();
  attachDiagnostics(page, diagnostics);
  const externalPath = '/login?from=external-menu';

  await page.route('**/api/dashboard/track-visit', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        data: true,
        msg: 'ok'
      })
    });
  });

  await loginAsAdmin(page);

  await page.evaluate(({ externalPath }) => {
    localStorage.setItem('AUTH_MENU_TREE', JSON.stringify([
      {
        pid: 0,
        id: 1,
        title: '系统管理',
        name: 'systemManagement',
        type: 1,
        path: '/systemManagement',
        key: 'main_system_management',
        icon: 'mdi:cog-outline',
        layout: '',
        isVisible: true,
        component: 'sys',
        meta: {
          title: '系统管理'
        },
        children: [
          {
            pid: 1,
            id: 2,
            title: '用户管理',
            name: 'systemUsers',
            type: 2,
            path: '/systemManagement/system/users',
            key: 'main_system_users',
            icon: 'solar:users-group-rounded-linear',
            layout: '',
            isVisible: true,
            component: 'sys/user',
            meta: {
              title: '用户管理',
              keepAlive: true
            }
          },
          {
            pid: 1,
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
              title: '外链文档',
              type: 'link',
              url: externalPath
            }
          }
        ]
      }
    ]));
    localStorage.setItem('AUTH_LAST_VIEW_PATH', '/systemManagement/system/users');
    localStorage.setItem('AUTH_TABS', JSON.stringify([]));
  }, { externalPath });

  await page.goto('/index');
  await page.waitForURL(/\/index$/);
  await page.evaluate(() => {
    window.history.pushState({}, '', '/systemManagement/system/users');
    window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
  });
  await page.waitForURL(/\/systemManagement\/system\/users$/);

  await expect(page.locator('.n-menu')).toContainText('外链文档');
  await page.getByRole('menuitem', { name: '系统管理' }).click();
  const externalMenuItem = page.getByRole('menuitem', { name: '外链文档' });
  await expect(externalMenuItem).toBeVisible();

  const popupPromise = page.waitForEvent('popup');
  await externalMenuItem.click({ force: true });
  const popup = await popupPromise;

  await popup.waitForLoadState('domcontentloaded');
  expect(new URL(popup.url()).pathname + new URL(popup.url()).search).toBe(externalPath);
  await expect(page).toHaveURL(/\/systemManagement\/system\/users$/);

  assertNoDiagnostics(diagnostics);
});
