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
  await page.goto('/featureDemo/vxeTable');
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

  await expect(page.locator('.column-panel__sorters').first()).toBeVisible();

  await page.locator('input[type="file"]').setInputFiles({
    name: 'vxe-table-import.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from(
      '\uFEFF用户名,角色,手机号,邮箱,状态\n'
      + 'import_valid,平台管理员,13800001031,import_valid@luckycolor.com,启用\n'
      + 'import_valid,平台管理员,13800001032,duplicate@luckycolor.com,启用\n'
      + 'import_invalid,未知角色,13800001033,invalid@luckycolor.com,启用'
    )
  });

  await expect(page.locator('.import-result-modal')).toContainText('导入结果');
  await expect(page.locator('.import-result-modal')).toContainText('导入已完成');
  await expect(page.locator('.import-result-modal')).toContainText('第 3 行');
  await expect(page.locator('.import-result-modal')).toContainText('第 4 行');
  await page.getByRole('button', { name: '我知道了' }).click();
  await expect(page.locator('body')).toContainText('import_valid');

  await page.getByRole('button', { name: 'admin', exact: true }).click();
  await expect(page.locator('.n-drawer')).toContainText('用户详情');
  await expect(page.locator('.n-drawer')).toContainText('编辑当前用户');
  await page.getByRole('button', { name: '关闭' }).last().click();

  await page.getByRole('button', { name: '新增用户' }).click();
  await expect(page.locator('.n-drawer')).toContainText('新增用户');
  await page.getByRole('button', { name: '取消' }).last().click();

  assertNoDiagnostics(diagnostics);
});
