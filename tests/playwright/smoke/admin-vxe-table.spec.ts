import { expect, test } from '@playwright/test';
import {
  assertNoDiagnostics,
  attachDiagnostics,
  createDiagnostics,
  loginAsAdmin
} from '../helpers/admin';

test('VxeTable 功能演示页面冒烟', async ({ page }) => {
  const diagnostics = createDiagnostics();
  attachDiagnostics(page, diagnostics);

  await loginAsAdmin(page);
  await page.locator('.modular_box').getByText('功能演示', { exact: true }).click();
  await page.getByRole('menuitem', { name: 'VxeTable' }).click();
  await page.waitForLoadState('networkidle');

  await expect(page.locator('body')).toContainText('新增用户');
  await expect(page.locator('body')).toContainText('批量删除');
  await expect(page.locator('body')).toContainText('用户名');
  await expect(page.locator('body')).toContainText('角色');
  await expect(page.locator('body')).toContainText('手机号');
  await expect(page.locator('body')).toContainText('邮箱');
  await expect(page.locator('body')).toContainText('创建时间');

  await expect(page.getByRole('button', { name: '导入' })).toBeVisible();
  await expect(page.getByRole('button', { name: '下载模板' })).toBeVisible();
  await expect(page.getByRole('button', { name: '导出' })).toBeVisible();
  await expect(page.getByRole('button', { name: '打印' })).toBeVisible();
  await expect(page.getByRole('button', { name: '刷新' })).toBeVisible();
  await expect(page.getByRole('button', { name: '全屏放大' })).toBeVisible();
  await expect(page.getByRole('button', { name: '列字段操作' })).toBeVisible();

  await page.getByRole('button', { name: '列字段操作' }).click();
  await expect(page.locator('.column-panel')).toContainText('列字段设置');
  await expect(page.locator('.column-panel')).toContainText('不固定');
  await expect(page.locator('.column-panel')).toContainText('重置');

  await page.getByRole('button', { name: 'admin', exact: true }).click();
  await expect(page.locator('.n-drawer')).toContainText('用户详情');
  await expect(page.locator('.n-drawer')).toContainText('编辑当前用户');
  await page.getByRole('button', { name: '关闭' }).last().click();

  await page.getByRole('button', { name: '新增用户' }).click();
  await expect(page.locator('.n-drawer')).toContainText('新增用户');
  await page.getByRole('button', { name: '取消' }).last().click();

  assertNoDiagnostics(diagnostics);
});
