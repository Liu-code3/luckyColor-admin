import { request } from '@/utils/http';

export interface DictionaryRecord {
  id: string;
  parentId?: string;
  weight: number;
  name: string;
  tenantId?: string;
  dictLabel: string;
  dictValue: string;
  category: string;
  sortCode: number;
  status?: boolean;
  deleteFlag: string;
  createTime?: string | null;
  createUser?: string | null;
  updateTime?: string | null;
  updateUser?: string | null;
  children?: DictionaryRecord[];
}

export interface CreateDictionaryPayload {
  id?: string;
  parentId?: string;
  weight: number;
  name: string;
  tenantId?: string;
  dictLabel: string;
  dictValue: string;
  category: string;
  sortCode: number;
  status?: boolean;
  deleteFlag: string;
  createTime?: string;
  createUser?: string;
  updateTime?: string;
  updateUser?: string;
}

export interface UpdateDictionaryPayload {
  parentId?: string;
  weight?: number;
  name?: string;
  tenantId?: string;
  dictLabel?: string;
  dictValue?: string;
  category?: string;
  sortCode?: number;
  status?: boolean;
  deleteFlag?: string;
  createTime?: string;
  createUser?: string;
  updateTime?: string;
  updateUser?: string;
}

export function getDictDetailApi(id: string) {
  return request<never, DictionaryRecord>({
    url: `/dict/${id}`,
    method: 'get'
  });
}

export function createDictApi(data: CreateDictionaryPayload) {
  return request<CreateDictionaryPayload, DictionaryRecord>({
    url: '/dict',
    method: 'post',
    data
  });
}

export function updateDictApi(id: string, data: UpdateDictionaryPayload) {
  return request<UpdateDictionaryPayload, DictionaryRecord>({
    url: `/dict/${id}`,
    method: 'patch',
    data
  });
}

export function deleteDictApi(id: string) {
  return request<never, boolean>({
    url: `/dict/${id}`,
    method: 'delete'
  });
}

export interface DictCacheRefreshResult {
  cacheKey: string;
  count: number;
  refreshedAt: string;
}

export function refreshDictCacheApi() {
  return request<never, DictCacheRefreshResult>({
    url: '/dict/refresh-cache',
    method: 'post'
  });
}
