import { request } from '@/utils/http';
import type { PageResult } from './types';

interface BackendPageResult<T> {
  list: T[];
  total: number;
}

export interface I18nResourceQueryParams {
  pageNo?: number;
  pageSize?: number;
  locale?: string;
  namespace?: string;
  resourceKey?: string;
  status?: number;
}

export interface I18nResourceRecord {
  id: number;
  tenantId?: number | null;
  locale: string;
  namespace: string;
  resourceKey: string;
  resourceValue: string;
  version: number;
  status: number;
  remark?: string | null;
}

export interface I18nResourcePayload {
  locale: string;
  namespace: string;
  resourceKey: string;
  resourceValue: string;
  status: number;
  remark?: string;
}

export async function getI18nResourcePageApi(params: I18nResourceQueryParams) {
  const pageNo = params.pageNo ?? 1;
  const pageSize = params.pageSize ?? 20;
  const response = await request<I18nResourceQueryParams, BackendPageResult<I18nResourceRecord>>({
    url: '/admin/i18n-resources/page',
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
    } satisfies PageResult<I18nResourceRecord>
  };
}

export function getI18nResourceDetailApi(id: number) {
  return request<never, I18nResourceRecord>({
    url: `/admin/i18n-resources/${id}`,
    method: 'get'
  });
}

export function createI18nResourceApi(data: I18nResourcePayload) {
  return request<I18nResourcePayload, number>({
    url: '/admin/i18n-resources',
    method: 'post',
    data
  });
}

export function updateI18nResourceApi(id: number, data: I18nResourcePayload) {
  return request<I18nResourcePayload, boolean>({
    url: `/admin/i18n-resources/${id}`,
    method: 'put',
    data
  });
}

export function updateI18nResourceStatusApi(id: number, status: number) {
  return request<{ status: number }, boolean>({
    url: `/admin/i18n-resources/${id}/status`,
    method: 'put',
    data: { status }
  });
}

export function bumpI18nResourceVersionApi(id: number) {
  return request<never, boolean>({
    url: `/admin/i18n-resources/${id}/version`,
    method: 'put'
  });
}
