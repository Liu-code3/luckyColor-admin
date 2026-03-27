import { expect, test } from '@playwright/test';
import {
  assertNoDiagnostics,
  attachDiagnostics,
  createDiagnostics,
  loginAsAdmin
} from '../helpers/admin';

test('租户管理与租户套餐页面冒烟', async ({ page }) => {
  const diagnostics = createDiagnostics();
  attachDiagnostics(page, diagnostics);

  await loginAsAdmin(page);

  await page.goto('/tenantCenter/tenantPackage');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toContainText('套餐总数');
  await expect(page.getByRole('button', { name: '新增套餐' })).toBeVisible();
  await page.getByRole('button', { name: '新增套餐' }).click();
  await expect(page.locator('.n-drawer')).toContainText('新增租户套餐');
  await expect(page.locator('.n-drawer')).toContainText('能力开关（JSON 对象）');
  await page.getByRole('button', { name: '取消' }).last().click();

  await page.goto('/tenantCenter/tenant');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toContainText('租户总数');
  await expect(page.getByRole('button', { name: '新增租户' })).toBeVisible();
  const firstOperationCell = page.locator('.operation-cell').first();
  await expect(firstOperationCell.getByRole('button', { name: /启用|停用/ })).toBeVisible();
  await expect(firstOperationCell.getByRole('button', { name: '删除' })).toBeVisible();
  await firstOperationCell.getByRole('button', { name: /启用|停用/ }).click();
  await expect(page.locator('.n-dialog')).toContainText(/启用租户|停用租户/);
  await page.getByRole('button', { name: '取消' }).click();
  await firstOperationCell.getByRole('button', { name: '删除' }).click();
  await expect(page.locator('.n-dialog')).toContainText('删除租户');
  await page.getByRole('button', { name: '取消' }).click();
  await page.getByRole('button', { name: '新增租户' }).click();
  await expect(page.locator('.n-drawer')).toContainText('新增租户');
  await expect(page.locator('.n-drawer')).toContainText('初始化管理员');
  await expect(page.locator('.n-drawer')).toContainText('租户套餐');
  await page.getByRole('button', { name: '取消' }).last().click();

  assertNoDiagnostics(diagnostics);
});
