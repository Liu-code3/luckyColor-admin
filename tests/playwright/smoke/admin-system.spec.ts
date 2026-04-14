import { expect, test } from '@playwright/test';
import {
  assertNoDiagnostics,
  attachDiagnostics,
  createDiagnostics,
  loginAsAdmin
} from '../helpers/admin';

test('系统管理主链路冒烟', async ({ page }) => {
  const diagnostics = createDiagnostics();
  attachDiagnostics(page, diagnostics);

  await loginAsAdmin(page);
  await page.getByRole('menuitem', { name: '系统管理' }).click();
  await expect(page.locator('.n-menu')).toContainText('字典管理');
  await page.getByRole('menuitem', { name: '用户管理' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: '新增用户' })).toBeVisible();
  await page.getByRole('button', { name: '新增用户' }).click();
  await expect(page.locator('.n-drawer')).toContainText('新增用户');
  await page.getByRole('button', { name: '取消' }).last().click();
  await page.getByRole('button', { name: '分配角色' }).first().click();
  await expect(page.locator('.n-modal')).toContainText('分配角色');
  await page.getByRole('button', { name: '取消' }).last().click();

  await page.getByRole('menuitem', { name: '角色管理' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: '新增角色' })).toBeVisible();
  await page.getByRole('button', { name: '分配菜单' }).first().click();
  await expect(page.locator('.n-modal')).toContainText('分配菜单');
  await page.getByRole('button', { name: '取消' }).last().click();

  await page.getByRole('menuitem', { name: '部门管理' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.tree-card')).toContainText('部门树');
  await page.getByRole('button', { name: '新增部门' }).click();
  await expect(page.locator('.n-drawer')).toContainText('新增部门');
  await page.getByRole('button', { name: '取消' }).last().click();

  await page.getByRole('menuitem', { name: '菜单管理' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.n-data-table')).toBeVisible();
  await page.getByRole('button', { name: '新增菜单' }).click();
  await expect(page.locator('.n-drawer')).toContainText('新增菜单');
  await page.getByRole('button', { name: '取消' }).last().click();

  await page.getByRole('menuitem', { name: '字典管理' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.n-tree')).toBeVisible();
  await expect(page.locator('.dict-table-card')).toBeVisible();
  await expect(page.getByRole('button', { name: '新增一级字典' })).toBeVisible();
  await expect(page.getByRole('button', { name: '批量删除' })).toBeVisible();
  await expect(page.getByRole('button', { name: '导出当前结果' })).toBeVisible();
  await expect(page.getByRole('button', { name: '下载导入模板' })).toBeVisible();
  await expect(page.getByRole('button', { name: '导入 CSV' })).toBeVisible();

  await page.getByRole('menuitem', { name: '配置管理' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: '新增配置' })).toBeVisible();
  await expect(page.getByRole('button', { name: '刷新缓存' })).toBeVisible();
  await page.getByRole('button', { name: '刷新缓存' }).click();
  await expect(page.locator('body')).toContainText('配置缓存刷新成功');
  await page.getByRole('button', { name: '新增配置' }).click();
  await expect(page.locator('.n-drawer')).toContainText('新增配置');
  await page.getByRole('button', { name: '取消' }).last().click();

  await page.getByRole('menuitem', { name: '公告管理' }).click();
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('button', { name: '新增公告' })).toBeVisible();
  await page.getByRole('button', { name: '新增公告' }).click();
  await expect(page.locator('.n-drawer')).toContainText('新增公告');
  await page.getByRole('button', { name: '取消' }).last().click();

  assertNoDiagnostics(diagnostics);
});
