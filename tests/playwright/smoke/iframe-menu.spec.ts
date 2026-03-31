import { expect, test } from '@playwright/test';
import {
  assertNoDiagnostics,
  attachDiagnostics,
  createDiagnostics
} from '../helpers/admin';

test('iframe 菜单点击后在当前页渲染内嵌页面', async ({ page }) => {
  const diagnostics = createDiagnostics();
  attachDiagnostics(page, diagnostics);
  const iframeUrl = `data:text/html;charset=utf-8,${encodeURIComponent(
    '<!doctype html><html lang="zh-CN"><body><h1>Iframe Menu Page</h1></body></html>'
  )}`;
  const accessToken = 'mock-access-token';

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

  await page.route('**/api/auth/refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        code: 200,
        data: {
          accessToken,
          tokenType: 'Bearer'
        },
        msg: 'ok'
      })
    });
  });

  await page.addInitScript(({ iframeUrl }) => {
    if (!window.location.href.startsWith('http')) {
      return;
    }

    const menuTree = [
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
            title: '接口文档',
            name: 'systemApifoxDoc',
            type: 2,
            path: '/systemManagement/system/apifox',
            key: 'main_system_apifox_doc',
            icon: 'simple-icons:apifox',
            layout: '',
            isVisible: true,
            component: 'tool/apifox/index',
            meta: {
              title: '接口文档'
            }
          },
          {
            pid: 1,
            id: 999002,
            title: '内嵌文档',
            name: 'iframeDocs',
            type: 2,
            path: iframeUrl,
            key: 'main_system_iframe_docs',
            icon: 'mdi:monitor-dashboard',
            layout: '',
            isVisible: true,
            component: 'sys',
            meta: {
              title: '内嵌文档',
              type: 'iframe',
              url: iframeUrl
            }
          }
        ]
      }
    ];

    localStorage.setItem('AUTH_USER_INFO', JSON.stringify({
      username: 'admin',
      displayName: '管理员',
      buttonCodeList: []
    }));
    localStorage.setItem('AUTH_MENU_TREE', JSON.stringify(menuTree));
    localStorage.setItem('AUTH_LAST_VIEW_PATH', '/systemManagement/system/apifox');
    localStorage.setItem('AUTH_TABS', JSON.stringify([]));
  }, { iframeUrl });

  await page.goto('/systemManagement/system/apifox');
  await page.waitForLoadState('networkidle');

  await expect(page.locator('.n-menu')).toContainText('内嵌文档');

  const currentPageCount = page.context().pages().length;
  await page.locator('.n-menu').getByText('内嵌文档', { exact: true }).click();
  await page.waitForURL(/\/i\/iframeDocs$/);
  await page.waitForLoadState('networkidle');

  await expect(page.locator('body')).toContainText('内嵌文档');
  await expect(page.locator('iframe')).toBeVisible();
  await expect(page.locator('iframe')).toHaveAttribute('src', iframeUrl);

  await page.waitForTimeout(500);
  expect(page.context().pages()).toHaveLength(currentPageCount);

  assertNoDiagnostics(diagnostics);
});
