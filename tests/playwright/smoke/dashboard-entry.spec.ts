import { expect, test } from '@playwright/test';
import {
  assertNoDiagnostics,
  attachDiagnostics,
  createDiagnostics,
  FRONTEND_URL
} from '../helpers/admin';

test('未登录访问 /index 时跳转到登录页', async ({ page }) => {
  await page.goto(`${FRONTEND_URL}/index`);
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveURL(/\/login$/);
});

test('已登录访问 /index 时恢复到上次退出页面', async ({ page }) => {
  const diagnostics = createDiagnostics();
  attachDiagnostics(page, diagnostics);
  const iframeUrl = `data:text/html;charset=utf-8,${encodeURIComponent(
    '<!doctype html><html lang="zh-CN"><body><h1>Recovered Last View</h1></body></html>'
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
        title: '首页',
        name: 'indexIndex',
        type: 1,
        path: '/index',
        key: 'main_analysis',
        icon: 'pajamas:overview',
        layout: '',
        isVisible: true,
        component: 'index/index'
      },
      {
        pid: 0,
        id: 2,
        title: '内嵌文档',
        name: 'iframeDocs',
        type: 2,
        path: iframeUrl,
        key: 'main_iframe_docs',
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
    ];

    localStorage.setItem('AUTH_USER_INFO', JSON.stringify({
      username: 'admin',
      displayName: '管理员',
      buttonCodeList: []
    }));
    localStorage.setItem('AUTH_MENU_TREE', JSON.stringify(menuTree));
    localStorage.setItem('AUTH_LAST_VIEW_PATH', '/i/iframeDocs');
    localStorage.setItem('AUTH_TABS', JSON.stringify([]));
  }, { iframeUrl });

  await page.goto('/index');
  await page.waitForURL(/\/i\/iframeDocs$/);
  await page.waitForLoadState('networkidle');

  await expect(page.locator('iframe')).toBeVisible();
  await expect(page.locator('iframe')).toHaveAttribute('src', iframeUrl);

  assertNoDiagnostics(diagnostics);
});
