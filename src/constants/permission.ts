export const SUPER_BUTTON_CODE_LIST = [ '*', '*:*:*' ] as const;

export const BUTTON_PERMISSION_CODES = {
  tenantManage: {
    create: 'tenant:manage:create',
    update: 'tenant:manage:update'
  },
  tenantPackage: {
    create: 'tenant:package:create',
    update: 'tenant:package:update',
    delete: 'tenant:package:delete'
  }
} as const;

export const DEFAULT_ADMIN_BUTTON_CODE_LIST = [
  BUTTON_PERMISSION_CODES.tenantManage.create,
  BUTTON_PERMISSION_CODES.tenantManage.update,
  BUTTON_PERMISSION_CODES.tenantPackage.create,
  BUTTON_PERMISSION_CODES.tenantPackage.update,
  BUTTON_PERMISSION_CODES.tenantPackage.delete
] as const;
