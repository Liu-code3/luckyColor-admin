import { request } from '@/utils/http';
import type { PageQueryParams, PageResult } from './types';

export interface RoleQueryParams extends PageQueryParams {
  keyword?: string;
}

export interface RoleRecord {
  id: string;
  name: string;
  code: string;
  sort: number;
  status: boolean;
  remark?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRolePayload {
  name: string;
  code: string;
  sort?: number;
  status?: boolean;
  remark?: string;
}

export interface UpdateRolePayload {
  name?: string;
  code?: string;
  sort?: number;
  status?: boolean;
  remark?: string | null;
}

export interface RoleAssignedMenu {
  id: number;
  pid: number;
  title: string;
  name: string;
  type: number;
  path: string;
  key: string;
  isVisible: boolean;
  sort: number;
}

export interface RoleMenuAssignment {
  roleId: string;
  name: string;
  code: string;
  menuIds: number[];
  menus: RoleAssignedMenu[];
}

export function getRolePageApi(params: RoleQueryParams) {
  return request<RoleQueryParams, PageResult<RoleRecord>>({
    url: '/roles',
    method: 'get',
    params
  });
}

export function getRoleDetailApi(id: string) {
  return request<never, RoleRecord>({
    url: `/roles/${id}`,
    method: 'get'
  });
}

export function createRoleApi(data: CreateRolePayload) {
  return request<CreateRolePayload, RoleRecord>({
    url: '/roles',
    method: 'post',
    data
  });
}

export function updateRoleApi(id: string, data: UpdateRolePayload) {
  return request<UpdateRolePayload, RoleRecord>({
    url: `/roles/${id}`,
    method: 'patch',
    data
  });
}

export function deleteRoleApi(id: string) {
  return request<never, boolean>({
    url: `/roles/${id}`,
    method: 'delete'
  });
}

export function getRoleMenusApi(id: string) {
  return request<never, RoleMenuAssignment>({
    url: `/roles/${id}/menus`,
    method: 'get'
  });
}

export function assignRoleMenusApi(id: string, menuIds: number[]) {
  return request<{ menuIds: number[] }, RoleMenuAssignment>({
    url: `/roles/${id}/menus`,
    method: 'put',
    data: { menuIds }
  });
}
