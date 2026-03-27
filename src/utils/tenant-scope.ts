import { getCurrentTenantContext } from '@/utils/auth';

export interface TenantScopedRecordLike {
  tenantId?: string | null;
  tenantName?: string | null;
}

export function getCurrentTenantScopeId() {
  return getCurrentTenantContext()?.tenantId || '';
}

export function belongsToCurrentTenant(record: TenantScopedRecordLike | null | undefined) {
  const currentTenantId = getCurrentTenantScopeId();
  const recordTenantId = record?.tenantId?.trim();

  if (!currentTenantId || !recordTenantId)
    return true;

  return recordTenantId === currentTenantId;
}

export function filterRecordsByCurrentTenant<T extends TenantScopedRecordLike>(records: T[]) {
  const currentTenantId = getCurrentTenantScopeId();
  if (!currentTenantId)
    return records;

  const hasExplicitTenantId = records.some(item => Boolean(item.tenantId?.trim()));
  if (!hasExplicitTenantId)
    return records;

  return records.filter(item => item.tenantId?.trim() === currentTenantId);
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

export function filterTreeRecordsByCurrentTenant<T extends TenantScopedTreeRecordLike>(records: T[]): T[] {
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

      if (belongsToCurrentTenant(node) || filteredChildren.length) {
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
