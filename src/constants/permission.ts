export const SUPER_BUTTON_CODE_LIST = [ '*', '*:*:*' ] as const;
export const SUPER_ADMIN_IDENTITY_LIST = [ 'admin', 'super_admin' ] as const;
export const PLATFORM_ADMIN_ROLE_CODE_LIST = [ 'super_admin', 'platform_admin' ] as const;
export const TENANT_ADMIN_ROLE_CODE_LIST = [ 'tenant_admin' ] as const;

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
  systemDepartment: {
    create: 'system:department:create',
    update: 'system:department:update',
    delete: 'system:department:delete'
  },
  tenantManage: {
    create: 'tenant:manage:create',
    update: 'tenant:manage:update',
    delete: 'tenant:manage:delete',
    changeStatus: 'tenant:manage:change-status'
  },
  tenantPackage: {
    create: 'tenant:package:create',
    update: 'tenant:package:update',
    delete: 'tenant:package:delete',
    bind: 'tenant:package:bind'
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
  BUTTON_PERMISSION_CODES.systemDepartment.create,
  BUTTON_PERMISSION_CODES.systemDepartment.update,
  BUTTON_PERMISSION_CODES.systemDepartment.delete,
  BUTTON_PERMISSION_CODES.tenantManage.create,
  BUTTON_PERMISSION_CODES.tenantManage.update,
  BUTTON_PERMISSION_CODES.tenantManage.delete,
  BUTTON_PERMISSION_CODES.tenantManage.changeStatus,
  BUTTON_PERMISSION_CODES.tenantPackage.create,
  BUTTON_PERMISSION_CODES.tenantPackage.update,
  BUTTON_PERMISSION_CODES.tenantPackage.delete,
  BUTTON_PERMISSION_CODES.tenantPackage.bind
] as const;
