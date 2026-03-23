import { request } from '@/utils/http';
import type { PageQueryParams, PageResult } from './types';

export interface TenantPackageQueryParams extends PageQueryParams {
  keyword?: string;
  status?: boolean;
}

export interface TenantPackageRecord {
  id: string;
  code: string;
  name: string;
  status: boolean;
  maxUsers?: number | null;
  maxRoles?: number | null;
  maxMenus?: number | null;
  featureFlags?: Record<string, unknown> | null;
  remark?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTenantPackagePayload {
  id?: string;
  code: string;
  name: string;
  status?: boolean;
  maxUsers?: number;
  maxRoles?: number;
  maxMenus?: number;
  featureFlags?: Record<string, unknown>;
  remark?: string;
}

export interface UpdateTenantPackagePayload {
  code?: string;
  name?: string;
  status?: boolean;
  maxUsers?: number;
  maxRoles?: number;
  maxMenus?: number;
  featureFlags?: Record<string, unknown>;
  remark?: string | null;
}

export function getTenantPackagePageApi(params: TenantPackageQueryParams) {
  return request<TenantPackageQueryParams, PageResult<TenantPackageRecord>>({
    url: '/tenant-packages',
    method: 'get',
    params
  });
}

export function getTenantPackageDetailApi(id: string) {
  return request<never, TenantPackageRecord>({
    url: `/tenant-packages/${id}`,
    method: 'get'
  });
}

export function createTenantPackageApi(data: CreateTenantPackagePayload) {
  return request<CreateTenantPackagePayload, TenantPackageRecord>({
    url: '/tenant-packages',
    method: 'post',
    data
  });
}

export function updateTenantPackageApi(id: string, data: UpdateTenantPackagePayload) {
  return request<UpdateTenantPackagePayload, TenantPackageRecord>({
    url: `/tenant-packages/${id}`,
    method: 'patch',
    data
  });
}

export function deleteTenantPackageApi(id: string) {
  return request<never, boolean>({
    url: `/tenant-packages/${id}`,
    method: 'delete'
  });
}
