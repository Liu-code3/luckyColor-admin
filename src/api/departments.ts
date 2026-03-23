import { request } from '@/utils/http';
import type { PageQueryParams, PageResult } from './types';

export interface DepartmentQueryParams extends PageQueryParams {
  keyword?: string;
}

export interface DepartmentRecord {
  pid: number;
  id: number;
  name: string;
  code: string;
  leader?: string | null;
  phone?: string | null;
  email?: string | null;
  sort: number;
  status: boolean;
  remark?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentTreeRecord extends DepartmentRecord {
  children?: DepartmentTreeRecord[];
}

export interface CreateDepartmentPayload {
  id?: number;
  parentId?: number | null;
  name: string;
  code: string;
  leader?: string;
  phone?: string;
  email?: string;
  sort?: number;
  status?: boolean;
  remark?: string;
}

export interface UpdateDepartmentPayload {
  parentId?: number | null;
  name?: string;
  code?: string;
  leader?: string | null;
  phone?: string | null;
  email?: string | null;
  sort?: number;
  status?: boolean;
  remark?: string | null;
}

export function getDepartmentPageApi(params: DepartmentQueryParams) {
  return request<DepartmentQueryParams, PageResult<DepartmentRecord>>({
    url: '/departments',
    method: 'get',
    params
  });
}

export function getDepartmentTreeApi() {
  return request<never, DepartmentTreeRecord[]>({
    url: '/departments/tree',
    method: 'get'
  });
}

export function getDepartmentDetailApi(id: number) {
  return request<never, DepartmentRecord>({
    url: `/departments/${id}`,
    method: 'get'
  });
}

export function createDepartmentApi(data: CreateDepartmentPayload) {
  return request<CreateDepartmentPayload, DepartmentRecord>({
    url: '/departments',
    method: 'post',
    data
  });
}

export function updateDepartmentApi(id: number, data: UpdateDepartmentPayload) {
  return request<UpdateDepartmentPayload, DepartmentRecord>({
    url: `/departments/${id}`,
    method: 'patch',
    data
  });
}

export function deleteDepartmentApi(id: number) {
  return request<never, boolean>({
    url: `/departments/${id}`,
    method: 'delete'
  });
}
