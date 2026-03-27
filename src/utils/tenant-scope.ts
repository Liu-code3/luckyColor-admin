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
