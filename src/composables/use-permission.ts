import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue';
import {
  checkPermissions,
  getCurrentButtonCodeList,
  hasSuperPermission as checkSuperPermission,
  normalizePermissionCodes,
  type PermissionCheckOptions,
  type PermissionCodeList,
  type PermissionValue
} from '@/utils/permission';

function mergePermissionOptions(
  baseOptions?: PermissionCheckOptions,
  nextOptions?: PermissionCheckOptions
) {
  return {
    ...baseOptions,
    ...nextOptions
  };
}

export function usePermission(
  currentPermissions?: MaybeRefOrGetter<PermissionValue | undefined>,
  defaultOptions?: PermissionCheckOptions
) {
  const buttonCodeList = computed<PermissionCodeList>(() => {
    const permissionSource = currentPermissions === undefined
      ? getCurrentButtonCodeList()
      : toValue(currentPermissions);

    return normalizePermissionCodes(permissionSource);
  });

  const hasPermission = (
    permissions: PermissionValue,
    options?: PermissionCheckOptions
  ) => checkPermissions(
    buttonCodeList.value,
    permissions,
    mergePermissionOptions(defaultOptions, options)
  );

  const hasAnyPermission = (permissions: PermissionValue) =>
    hasPermission(permissions);

  const hasAllPermissions = (
    permissions: PermissionValue,
    options?: Omit<PermissionCheckOptions, 'mode'>
  ) => hasPermission(permissions, {
    ...options,
    mode: 'and'
  });

  const lacksPermission = (
    permissions: PermissionValue,
    options?: PermissionCheckOptions
  ) => !hasPermission(permissions, options);

  const hasSuperPermission = (superCodes?: PermissionValue) =>
    checkSuperPermission(
      buttonCodeList.value,
      superCodes || defaultOptions?.superCodes
    );

  const can = (
    permissions: PermissionValue,
    options?: PermissionCheckOptions
  ): ComputedRef<boolean> => computed(() => hasPermission(permissions, options));

  const cannot = (
    permissions: PermissionValue,
    options?: PermissionCheckOptions
  ): ComputedRef<boolean> => computed(() => lacksPermission(permissions, options));

  return {
    buttonCodeList,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    lacksPermission,
    hasSuperPermission,
    can,
    cannot
  };
}
