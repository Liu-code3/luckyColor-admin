import { request } from '@/utils/http';
import { mergeDataScopeQueryParams } from '@/utils/data-scope';
import type { DataScopeQueryParams, PageQueryParams, PageResult } from './types';

export interface ConfigQueryParams extends PageQueryParams, DataScopeQueryParams {
  keyword?: string;
}

export interface ConfigRecord {
  id: string;
  configKey: string;
  configName: string;
  configValue: string;
  valueType: string;
  status: boolean;
  remark?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigCacheRefreshResult {
  cacheKey: string;
  count: number;
  refreshedAt: string;
}

export interface CreateConfigPayload {
  configKey: string;
  configName: string;
  configValue: string;
  valueType?: string;
  status?: boolean;
  remark?: string;
}

export interface UpdateConfigPayload {
  configKey?: string;
  configName?: string;
  configValue?: string;
  valueType?: string;
  status?: boolean;
  remark?: string | null;
}

export function getConfigPageApi(params: ConfigQueryParams) {
  return request<ConfigQueryParams, PageResult<ConfigRecord>>({
    url: '/configs',
    method: 'get',
    params: mergeDataScopeQueryParams(params)
  });
}

export function getConfigDetailApi(id: string) {
  return request<never, ConfigRecord>({
    url: `/configs/${id}`,
    method: 'get'
  });
}

export function createConfigApi(data: CreateConfigPayload) {
  return request<CreateConfigPayload, ConfigRecord>({
    url: '/configs',
    method: 'post',
    data
  });
}

export function updateConfigApi(id: string, data: UpdateConfigPayload) {
  return request<UpdateConfigPayload, ConfigRecord>({
    url: `/configs/${id}`,
    method: 'patch',
    data
  });
}

export function deleteConfigApi(id: string) {
  return request<never, boolean>({
    url: `/configs/${id}`,
    method: 'delete'
  });
}

export function refreshConfigCacheApi() {
  return request<never, ConfigCacheRefreshResult>({
    url: '/configs/refresh-cache',
    method: 'post'
  });
}
