import {
  DEFAULT_ADMIN_BUTTON_CODE_LIST,
  SUPER_BUTTON_CODE_LIST
} from '@/constants/permission';
import { getCurrentUserInfo } from '@/utils/auth';

export type PermissionMode = 'and' | 'or';
export type PermissionValue = string | string[];

export interface PermissionCheckOptions {
  mode?: PermissionMode;
  superCodes?: string[];
}

interface PermissionCodeCarrier {
  buttonCodeList?: unknown;
  buttonCodes?: unknown;
  permissions?: unknown;
  permissionCodes?: unknown;
}

export function getCurrentButtonCodeList() {
  return normalizePermissionCodes(getCurrentUserInfo()?.buttonCodeList);
}

export function resolveSessionButtonCodeList(
  username: string,
  ...sources: Array<PermissionCodeCarrier | null | undefined>
) {
  const permissionCodes = collectPermissionCodes(...sources);

  if (permissionCodes.length) {
    return permissionCodes;
  }

  // 后端权限字段尚未完全联调时，保留 admin 的租户中心演示权限，避免页面入口全部消失。
  if (username === 'admin') {
    return [ ...DEFAULT_ADMIN_BUTTON_CODE_LIST ];
  }

  return [];
}

export function hasPermission(
  permissions: PermissionValue,
  options: PermissionCheckOptions = {}
) {
  const requiredPermissions = normalizePermissionCodes(permissions);

  if (!requiredPermissions.length) {
    return false;
  }

  const currentPermissions = getCurrentButtonCodeList();

  if (!currentPermissions.length) {
    return false;
  }

  const currentPermissionSet = new Set(currentPermissions);
  const superCodes = normalizePermissionCodes(options.superCodes ?? [ ...SUPER_BUTTON_CODE_LIST ]);

  if (superCodes.some(code => currentPermissionSet.has(code))) {
    return true;
  }

  const mode = options.mode === 'and' ? 'and' : 'or';

  if (mode === 'and') {
    return requiredPermissions.every(code => currentPermissionSet.has(code));
  }

  return requiredPermissions.some(code => currentPermissionSet.has(code));
}

export function hasAnyPermission(permissions: PermissionValue) {
  return hasPermission(permissions);
}

export function hasAllPermissions(permissions: PermissionValue) {
  return hasPermission(permissions, {
    mode: 'and'
  });
}

export function lacksPermission(
  permissions: PermissionValue,
  options?: PermissionCheckOptions
) {
  return !hasPermission(permissions, options);
}

export function hasPerm(permissions: PermissionValue, mode: PermissionMode = 'or') {
  return hasPermission(permissions, {
    mode
  });
}

function collectPermissionCodes(...sources: Array<PermissionCodeCarrier | null | undefined>) {
  return [ ...new Set(
    sources.flatMap(source => [
      ...normalizePermissionCodes(source?.buttonCodeList),
      ...normalizePermissionCodes(source?.buttonCodes),
      ...normalizePermissionCodes(source?.permissions),
      ...normalizePermissionCodes(source?.permissionCodes)
    ])
  ) ];
}

function normalizePermissionCodes(input: unknown) {
  if (typeof input === 'string') {
    const code = input.trim();
    return code ? [ code ] : [];
  }

  if (!Array.isArray(input)) {
    return [];
  }

  return [ ...new Set(
    input
      .filter((item): item is string => typeof item === 'string')
      .map(item => item.trim())
      .filter(Boolean)
  ) ];
}
