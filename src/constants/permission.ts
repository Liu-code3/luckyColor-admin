export const SUPER_BUTTON_CODE_LIST = [ '*', '*:*:*' ] as const;

export const BUTTON_PERMISSION_CODES = {
  systemUser: {
    create: 'system:user:create',
    update: 'system:user:update',
    delete: 'system:user:delete',
    assign: 'system:user:assign'
  },
  systemRole: {
    create: 'system:role:create',
    update: 'system:role:update',
    delete: 'system:role:delete',
    grant: 'system:role:grant'
  },
  systemMenu: {
    create: 'system:menu:create',
    update: 'system:menu:update',
    delete: 'system:menu:delete'
  },
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
  BUTTON_PERMISSION_CODES.systemUser.create,
  BUTTON_PERMISSION_CODES.systemUser.update,
  BUTTON_PERMISSION_CODES.systemUser.delete,
  BUTTON_PERMISSION_CODES.systemUser.assign,
  BUTTON_PERMISSION_CODES.systemRole.create,
  BUTTON_PERMISSION_CODES.systemRole.update,
  BUTTON_PERMISSION_CODES.systemRole.delete,
  BUTTON_PERMISSION_CODES.systemRole.grant,
  BUTTON_PERMISSION_CODES.systemMenu.create,
  BUTTON_PERMISSION_CODES.systemMenu.update,
  BUTTON_PERMISSION_CODES.systemMenu.delete,
  BUTTON_PERMISSION_CODES.tenantManage.create,
  BUTTON_PERMISSION_CODES.tenantManage.update,
  BUTTON_PERMISSION_CODES.tenantPackage.create,
  BUTTON_PERMISSION_CODES.tenantPackage.update,
  BUTTON_PERMISSION_CODES.tenantPackage.delete
] as const;
