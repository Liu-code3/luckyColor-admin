import { expect, test } from '@playwright/test';
import {
  assertNoDiagnostics,
  attachDiagnostics,
  createDiagnostics,
  getAdminSessionSnapshot,
  BACKEND_URL,
  loginAsAdmin
} from '../helpers/admin';

const REQUIRED_CODES = [
  'system:user:assign-role',
  'system:role:authorize',
  'tenant:create',
  'tenant:update',
  'tenant:delete',
  'tenant:package:create',
  'tenant:package:update',
  'tenant:package:delete'
] as const;

test('Spring Boot 权限链路与按钮显隐保持一致', async ({ page }) => {
  const diagnostics = createDiagnostics();
  attachDiagnostics(page, diagnostics);

  await loginAsAdmin(page);
  const session = await getAdminSessionSnapshot(page);

  const buttonPermissionSnapshot = await fetchApi(page, session.accessToken, `/api/auth/button-permissions?${new URLSearchParams(
    REQUIRED_CODES.map(code => [ 'codes', code ])
  ).toString()}`);
  expect(buttonPermissionSnapshot.code).toBe(200);

  const permissionMap = buttonPermissionSnapshot.data?.permissionMap || {};
  const buttonCodeList = buttonPermissionSnapshot.data?.buttonCodeList || [];
  for (const code of REQUIRED_CODES) {
    expect(permissionMap[code], `permissionMap 缺少 ${code}`).toBe(true);
    expect(buttonCodeList, `buttonCodeList 缺少 ${code}`).toContain(code);
  }

  const accessSnapshot = await fetchApi(page, session.accessToken, '/api/auth/access');
  expect(accessSnapshot.code).toBe(200);
  for (const code of REQUIRED_CODES) {
    expect(accessSnapshot.data?.user?.buttonCodeList || [], `access 快照缺少 ${code}`).toContain(code);
  }

  await page.goto('/systemManagement/system/users');
  await page.waitForURL(/\/systemManagement\/system\/users$/);
  const firstUserOperationCell = page.locator('.operation-cell').first();
  await expect(firstUserOperationCell.getByRole('button', { name: '分配角色' })).toBeVisible();
  await firstUserOperationCell.getByRole('button', { name: '分配角色' }).click();
  await expect(page.locator('.n-modal')).toContainText('分配角色');
  await page.getByRole('button', { name: '取消' }).last().click();

  await page.goto('/systemManagement/system/role');
  await page.waitForURL(/\/systemManagement\/system\/role$/);
  const firstRoleOperationCell = page.locator('.operation-cell').first();
  await expect(firstRoleOperationCell.getByRole('button', { name: '分配菜单' })).toBeVisible();
  await expect(firstRoleOperationCell.getByRole('button', { name: '数据权限' })).toBeVisible();
  await firstRoleOperationCell.getByRole('button', { name: '分配菜单' }).click();
  await expect(page.locator('.n-modal')).toContainText('分配菜单');
  await page.getByRole('button', { name: '取消' }).last().click();
  await firstRoleOperationCell.getByRole('button', { name: '数据权限' }).click();
  await expect(page.locator('.n-modal')).toContainText('数据权限');
  await page.getByRole('button', { name: '取消' }).last().click();

  await page.goto('/tenantCenter/tenantPackage');
  await page.waitForURL(/\/tenantCenter\/tenantPackage$/);
  await expect(page.getByRole('button', { name: '新增套餐' })).toBeVisible();
  const firstPackageOperationCell = page.locator('.operation-cell').first();
  await expect(firstPackageOperationCell.getByRole('button', { name: '菜单范围' })).toBeVisible();
  await expect(firstPackageOperationCell.getByRole('button', { name: '绑定租户' })).toBeVisible();
  await expect(firstPackageOperationCell.getByRole('button', { name: '删除' })).toBeVisible();

  await page.goto('/tenantCenter/tenant');
  await page.waitForURL(/\/tenantCenter\/tenant$/);
  await expect(page.getByRole('button', { name: '新增租户' })).toBeVisible();
  const firstTenantOperationCell = page.locator('.operation-cell').first();
  await expect(firstTenantOperationCell.getByRole('button', { name: /启用|停用/ })).toBeVisible();
  await expect(firstTenantOperationCell.getByRole('button', { name: '删除' })).toBeVisible();

  assertNoDiagnostics(diagnostics);
});

async function fetchApi(page: import('@playwright/test').Page, accessToken: string, path: string) {
  const response = await page.request.get(`${BACKEND_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  return response.json();
}
