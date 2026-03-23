import { expect, test } from '@playwright/test';
import {
  assertNoDiagnostics,
  attachDiagnostics,
  createDiagnostics,
  loginAsAdmin
} from '../helpers/admin';

test('Apifox 接口文档页面冒烟', async ({ page }) => {
  const diagnostics = createDiagnostics();
  attachDiagnostics(page, diagnostics);

  await loginAsAdmin(page);
  await page.locator('.modular_box').getByText('Apifox').click();
  await page.waitForLoadState('networkidle');

  await expect(page.locator('body')).toContainText('Apifox');
  await expect(page.locator('body')).toContainText('LuckyColor Admin Serve API');
  await expect(page.locator('body')).toContainText('/docs');
  await expect(page.locator('iframe[title=\"Apifox API Docs\"]')).toBeVisible();

  assertNoDiagnostics(diagnostics);
});
