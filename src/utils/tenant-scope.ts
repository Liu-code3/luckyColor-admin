import { getCurrentTenantContext } from '@/utils/auth';
import { getCurrentUserInfo } from '@/utils/auth';
import { isPlatformAdminUser } from '@/utils/permission';

export interface TenantScopedRecordLike {
  tenantId?: string | null;
  tenantName?: string | null;
}

export interface TenantScopeFilterOptions {
  allowShared?: boolean;
  sharedTenantIds?: string[];
}

const DEFAULT_SHARED_TENANT_IDS = [ '0', 'system', 'shared', 'public', 'builtin' ];

export function getCurrentTenantScopeId() {
  return getCurrentTenantContext()?.tenantId || '';
}

export function isPlatformTenantScope() {
  return isPlatformAdminUser(getCurrentUserInfo());
}

function normalizeTenantId(value: string | null | undefined) {
  return value?.trim().toLowerCase() || '';
}

function resolveSharedTenantIds(options?: TenantScopeFilterOptions) {
  return options?.sharedTenantIds?.length
    ? options.sharedTenantIds.map(item => normalizeTenantId(item)).filter(Boolean)
    : DEFAULT_SHARED_TENANT_IDS;
}

export function isSharedTenantRecord(record: TenantScopedRecordLike | null | undefined, options?: TenantScopeFilterOptions) {
  const recordTenantId = normalizeTenantId(record?.tenantId);
  if (!recordTenantId) {
    return Boolean(options?.allowShared);
  }

  return resolveSharedTenantIds(options).includes(recordTenantId);
}

export function belongsToCurrentTenant(record: TenantScopedRecordLike | null | undefined) {
  if (isPlatformTenantScope()) {
    return true;
  }

  const currentTenantId = getCurrentTenantScopeId();
  const recordTenantId = record?.tenantId?.trim();

  if (!currentTenantId)
    return true;

  if (!recordTenantId)
    return false;

  return recordTenantId === currentTenantId;
}

export function canAccessTenantScopedRecord(record: TenantScopedRecordLike | null | undefined, options?: TenantScopeFilterOptions) {
  if (belongsToCurrentTenant(record)) {
    return true;
  }

  return Boolean(options?.allowShared && isSharedTenantRecord(record, options));
}

export function filterRecordsByCurrentTenant<T extends TenantScopedRecordLike>(records: T[], options?: TenantScopeFilterOptions) {
  if (isPlatformTenantScope()) {
    return records;
  }

  const currentTenantId = getCurrentTenantScopeId();
  if (!currentTenantId)
    return records;

  const hasExplicitTenantId = records.some(item => Boolean(item.tenantId?.trim()));
  if (!hasExplicitTenantId)
    return records;

  return records.filter(item => canAccessTenantScopedRecord(item, options));
}

interface TenantScopedTreeRecordLike extends TenantScopedRecordLike {
  children?: TenantScopedTreeRecordLike[] | null;
}

function hasExplicitTenantIdInTree(records: TenantScopedTreeRecordLike[]) {
  return records.some((record) => {
    if (record.tenantId?.trim())
      return true;

    if (record.children?.length)
      return hasExplicitTenantIdInTree(record.children);

    return false;
  });
}

export function filterTreeRecordsByCurrentTenant<T extends TenantScopedTreeRecordLike>(records: T[], options?: TenantScopeFilterOptions): T[] {
  if (isPlatformTenantScope()) {
    return records;
  }

  const currentTenantId = getCurrentTenantScopeId();
  if (!currentTenantId)
    return records;

  if (!hasExplicitTenantIdInTree(records))
    return records;

  const walk = (nodes: T[]): T[] => {
    return nodes.reduce<T[]>((result, node) => {
      const filteredChildren = node.children?.length
        ? walk(node.children as T[])
        : [];

      if (canAccessTenantScopedRecord(node, options) || filteredChildren.length) {
        result.push({
          ...node,
          children: filteredChildren
        });
      }

      return result;
    }, []);
  };

  return walk(records);
}
