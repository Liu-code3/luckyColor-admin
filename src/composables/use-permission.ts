import { computed } from 'vue';
import {
  getCurrentButtonCodeList,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  lacksPermission,
  type PermissionCheckOptions,
  type PermissionValue
} from '@/utils/permission';

export function usePermission() {
  return {
    buttonCodeList: computed(() => getCurrentButtonCodeList()),
    hasPermission: (permissions: PermissionValue, options?: PermissionCheckOptions) =>
      hasPermission(permissions, options),
    hasAnyPermission: (permissions: PermissionValue) => hasAnyPermission(permissions),
    hasAllPermissions: (permissions: PermissionValue) => hasAllPermissions(permissions),
    lacksPermission: (permissions: PermissionValue, options?: PermissionCheckOptions) =>
      lacksPermission(permissions, options)
  };
}
