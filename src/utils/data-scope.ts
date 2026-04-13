import { DATA_SCOPE_TYPES, normalizeDataScopeType, type DataScopeType } from '@/constants/data-scope';
import { getCurrentUserInfo } from '@/utils/auth';

export interface DataScopeQueryParams {
  dataScopeType?: DataScopeType;
  dataScopeDeptIds?: string;
  dataScopeUserId?: string;
}

interface DataScopeCarrier {
  id?: string | null;
  dataScopeType?: DataScopeType | null;
  dataScopeDeptIds?: Array<number | string> | null;
}

export function buildDataScopeQueryParams(source: DataScopeCarrier | null | undefined = getCurrentUserInfo()): DataScopeQueryParams {
  if (!source?.dataScopeType) {
    return {};
  }

  const dataScopeType = normalizeDataScopeType(source.dataScopeType);
  const dataScopeDeptIds = normalizeDeptIds(source.dataScopeDeptIds);
  const dataScopeUserId = source.id ? String(source.id) : undefined;

  const params: DataScopeQueryParams = {
    dataScopeType
  };

  if (dataScopeType === DATA_SCOPE_TYPES.CUSTOM && dataScopeDeptIds.length) {
    params.dataScopeDeptIds = dataScopeDeptIds.join(',');
  }

  if (
    dataScopeUserId
    && (
      dataScopeType === DATA_SCOPE_TYPES.DEPT
      || dataScopeType === DATA_SCOPE_TYPES.DEPT_AND_CHILD
      || dataScopeType === DATA_SCOPE_TYPES.SELF
    )
  ) {
    params.dataScopeUserId = dataScopeUserId;
  }

  return params;
}

export function mergeDataScopeQueryParams<T extends object>(params?: T): T & DataScopeQueryParams {
  const scopedParams = buildDataScopeQueryParams();
  return {
    ...((params || {}) as T),
    ...scopedParams
  };
}

function normalizeDeptIds(input: DataScopeCarrier['dataScopeDeptIds']) {
  if (!Array.isArray(input)) {
    return [];
  }

  return [ ...new Set(
    input
      .map((item) => {
        const normalized = Number(item);
        return Number.isFinite(normalized) ? normalized : null;
      })
      .filter((item): item is number => item !== null)
  ) ];
}
