import { request } from '@/utils/http';
import type { PageQueryParams, PageResult } from './types';

export type TenantStatus = 'ACTIVE' | 'DISABLED' | 'FROZEN';

export interface TenantPackageSummary {
  id: string;
  code: string;
  name: string;
  status: boolean;
}

export interface TenantRecord {
  id: string;
  code: string;
  name: string;
  status: TenantStatus;
  expiresAt?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  tenantPackage?: TenantPackageSummary | null;
  remark?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantQueryParams extends PageQueryParams {
  keyword?: string;
  status?: TenantStatus;
}

export interface CreateTenantPayload {
  id?: string;
  code: string;
  name: string;
  packageId?: string;
  status?: TenantStatus;
  expiresAt?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  remark?: string;
  adminUsername?: string;
  adminPassword: string;
  adminNickname?: string;
}

export interface UpdateTenantPayload {
  name?: string;
  packageId?: string;
  status?: TenantStatus;
  expiresAt?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  remark?: string | null;
}

export interface TenantInitResult {
  tenant: TenantRecord;
  adminUser: {
    id: string;
    username: string;
    nickname?: string | null;
  };
  roles: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  departments: Array<{
    id: number;
    code: string;
    name: string;
  }>;
  menuIds: number[];
  dictionaryIds: string[];
}

export function getTenantPageApi(params: TenantQueryParams) {
  return request<TenantQueryParams, PageResult<TenantRecord>>({
    url: '/tenants',
    method: 'get',
    params
  });
}

export function getTenantDetailApi(id: string) {
  return request<never, TenantRecord>({
    url: `/tenants/${id}`,
    method: 'get'
  });
}

export function createTenantApi(data: CreateTenantPayload) {
  return request<CreateTenantPayload, TenantInitResult>({
    url: '/tenants',
    method: 'post',
    data
  });
}

export function updateTenantApi(id: string, data: UpdateTenantPayload) {
  return request<UpdateTenantPayload, TenantRecord>({
    url: `/tenants/${id}`,
    method: 'patch',
    data
  });
}

export function deleteTenantApi(id: string) {
  return request<never, boolean>({
    url: `/tenants/${id}`,
    method: 'delete'
  });
}
