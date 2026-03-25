import {
  DEFAULT_ADMIN_BUTTON_CODE_LIST,
  SUPER_ADMIN_IDENTITY_LIST,
  SUPER_BUTTON_CODE_LIST
} from '@/constants/permission';
import { getCurrentUserInfo } from '@/utils/auth';

export type PermissionMode = 'and' | 'or';
export type PermissionValue = string | string[];
export type PermissionCodeList = string[];

export interface PermissionCheckOptions {
  mode?: PermissionMode;
  superCodes?: string[];
}

export interface PermissionCodeCarrier {
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
  const isSuperAdmin = isSuperAdminIdentity(username);

  if (permissionCodes.length) {
    return isSuperAdmin
      ? mergeSuperPermissionCodes(permissionCodes)
      : permissionCodes;
  }

  // 后端权限字段尚未完全联调时，保留 admin 的演示权限，避免入口全部消失。
  if (isSuperAdmin) {
    return mergeSuperPermissionCodes(DEFAULT_ADMIN_BUTTON_CODE_LIST);
  }

  return [];
}

export function isSuperAdminIdentity(value: unknown) {
  if (typeof value !== 'string') {
    return false;
  }

  const normalizedValue = value.trim().toLowerCase();
  if (!normalizedValue) {
    return false;
  }

  return SUPER_ADMIN_IDENTITY_LIST.some(item => item === normalizedValue);
}

export function hasPermission(
  permissions: PermissionValue,
  options: PermissionCheckOptions = {}
) {
  return checkPermissions(getCurrentButtonCodeList(), permissions, options);
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

export function checkPermissions(
  currentPermissions: PermissionValue,
  permissions: PermissionValue,
  options: PermissionCheckOptions = {}
) {
  const requiredPermissions = normalizePermissionCodes(permissions);
  if (!requiredPermissions.length) {
    return false;
  }

  const currentPermissionCodes = normalizePermissionCodes(currentPermissions);
  if (!currentPermissionCodes.length) {
    return false;
  }

  if (hasSuperPermission(currentPermissionCodes, options.superCodes)) {
    return true;
  }

  const currentPermissionSet = new Set(currentPermissionCodes);
  const mode = resolvePermissionMode(options.mode);

  if (mode === 'and') {
    return requiredPermissions.every(code => currentPermissionSet.has(code));
  }

  return requiredPermissions.some(code => currentPermissionSet.has(code));
}

export function hasAnyPermissionByCodes(
  currentPermissions: PermissionValue,
  permissions: PermissionValue,
  options?: Omit<PermissionCheckOptions, 'mode'>
) {
  return checkPermissions(currentPermissions, permissions, {
    ...options,
    mode: 'or'
  });
}

export function hasAllPermissionsByCodes(
  currentPermissions: PermissionValue,
  permissions: PermissionValue,
  options?: Omit<PermissionCheckOptions, 'mode'>
) {
  return checkPermissions(currentPermissions, permissions, {
    ...options,
    mode: 'and'
  });
}

export function hasSuperPermission(
  currentPermissions: PermissionValue,
  superCodes: PermissionValue = [ ...SUPER_BUTTON_CODE_LIST ]
) {
  const currentPermissionCodes = normalizePermissionCodes(currentPermissions);
  if (!currentPermissionCodes.length) {
    return false;
  }

  const currentPermissionSet = new Set(currentPermissionCodes);
  return normalizePermissionCodes(superCodes).some(code => currentPermissionSet.has(code));
}

export function collectPermissionCodes(
  ...sources: Array<PermissionCodeCarrier | null | undefined>
) {
  return [ ...new Set(
    sources.flatMap(source => [
      ...normalizePermissionCodes(source?.buttonCodeList),
      ...normalizePermissionCodes(source?.buttonCodes),
      ...normalizePermissionCodes(source?.permissions),
      ...normalizePermissionCodes(source?.permissionCodes)
    ])
  ) ];
}

export function normalizePermissionCodes(input: unknown): PermissionCodeList {
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

function mergeSuperPermissionCodes(permissionCodes: PermissionValue) {
  return normalizePermissionCodes([
    ...SUPER_BUTTON_CODE_LIST,
    ...normalizePermissionCodes(permissionCodes)
  ]);
}

function resolvePermissionMode(mode?: PermissionMode): PermissionMode {
  return mode === 'and' ? 'and' : 'or';
}
