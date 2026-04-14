import { expect, test } from '@playwright/test';
import {
  assertNoDiagnostics,
  attachDiagnostics,
  createDiagnostics,
  loginAsAdmin
} from '../helpers/admin';

test('动态路由组件不存在时展示 404 兜底页', async ({ page }) => {
  const diagnostics = createDiagnostics();
  attachDiagnostics(page, diagnostics);
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

  await page.evaluate(() => {
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
            title: '菜单管理',
            name: 'systemMenu',
            type: 2,
            path: '/systemManagement/system/menu',
            key: 'main_system_menu',
            icon: 'mdi:menu-open',
            layout: '',
            isVisible: true,
            component: 'sys/menu/index',
            meta: {
              title: '菜单管理'
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

    localStorage.setItem('AUTH_MENU_TREE', JSON.stringify(menuTree));
    localStorage.setItem('AUTH_LAST_VIEW_PATH', '/systemManagement/system/menu');
    localStorage.setItem('AUTH_TABS', JSON.stringify([]));
  });

  await page.goto('/index');
  await page.waitForURL(/\/index$/);
  await page.evaluate(() => {
    window.history.pushState({}, '', '/systemManagement/system/missing-view');
    window.dispatchEvent(new PopStateEvent('popstate', { state: window.history.state }));
  });

  await expect(page.getByText('404 资源不存在')).toBeVisible();

  assertNoDiagnostics(diagnostics);
});
