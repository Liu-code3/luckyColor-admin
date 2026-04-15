import { request } from '@/utils/http';
import type { PageResult } from './types';

interface BackendPageResult<T> {
  list: T[];
  total: number;
}

export interface OperationLogQueryParams {
  pageNo?: number;
  pageSize?: number;
  username?: string;
  bizModule?: string;
  operationType?: string;
  requestMethod?: string;
  requestUri?: string;
  success?: number;
}

export interface OperationLogRecord {
  id: number;
  tenantId?: number | null;
  userId?: number | null;
  username?: string | null;
  bizModule?: string | null;
  operationType?: string | null;
  requestMethod?: string | null;
  requestUri?: string | null;
  requestParams?: string | null;
  success?: number | null;
  statusCode?: number | null;
  durationMs?: number | null;
  remoteIp?: string | null;
  errorMessage?: string | null;
  createTime?: string | null;
}

export async function getOperationLogPageApi(params: OperationLogQueryParams) {
  const pageNo = params.pageNo ?? 1;
  const pageSize = params.pageSize ?? 20;
  const response = await request<OperationLogQueryParams, BackendPageResult<OperationLogRecord>>({
    url: '/admin/operation-logs/page',
    method: 'get',
    params
  });

  return {
    ...response,
    data: {
      records: response.data.list || [],
      current: pageNo,
      size: pageSize,
      total: response.data.total || 0
    } satisfies PageResult<OperationLogRecord>
  };
}
