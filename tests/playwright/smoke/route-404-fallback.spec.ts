import { expect, test } from '@playwright/test';
import {
  assertNoDiagnostics,
  attachDiagnostics,
  createDiagnostics
} from '../helpers/admin';

test('动态路由组件不存在时展示 404 兜底页', async ({ page }) => {
  const diagnostics = createDiagnostics();
  attachDiagnostics(page, diagnostics);
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

  await page.addInitScript(() => {
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
            id: 999003,
            title: '缺失页面',
            name: 'missingView',
            type: 2,
            path: '/systemManagement/system/missing-view',
            key: 'main_system_missing_view',
            icon: 'mdi:file-alert-outline',
            layout: '',
            isVisible: true,
            component: 'sys/missing/index',
            meta: {
              title: '缺失页面',
              keepAlive: true
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
  });

  await page.goto('/systemManagement/system/apifox');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.n-menu')).toContainText('缺失页面');

  await page.locator('.n-menu').getByText('缺失页面', { exact: true }).click();
  await page.waitForURL(/\/systemManagement\/system\/missing-view$/);
  await page.waitForLoadState('networkidle');

  await expect(page.getByText('404 资源不存在')).toBeVisible();

  assertNoDiagnostics(diagnostics);
});
