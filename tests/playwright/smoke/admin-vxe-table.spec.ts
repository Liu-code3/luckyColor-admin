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
  await page.getByText('VxeTable', { exact: true }).click();
  await page.waitForLoadState('networkidle');

  await expect(page.locator('body')).toContainText('新增用户');
  await expect(page.locator('body')).toContainText('批量删除');
  await expect(page.locator('body')).toContainText('列字段操作');
  await expect(page.locator('body')).toContainText('用户名');
  await expect(page.locator('body')).toContainText('角色');
  await expect(page.locator('body')).toContainText('手机号');
  await expect(page.locator('body')).toContainText('邮箱');
  await expect(page.locator('body')).toContainText('创建时间');

  await page.getByRole('button', { name: '新增用户' }).click();
  await expect(page.locator('.n-drawer')).toContainText('新增用户');
  await page.getByRole('button', { name: '取消' }).last().click();

  assertNoDiagnostics(diagnostics);
});
