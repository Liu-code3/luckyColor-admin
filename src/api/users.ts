import { request } from '@/utils/http';
import { mergeDataScopeQueryParams } from '@/utils/data-scope';
import type { DataScopeQueryParams, PageQueryParams, PageResult } from './types';

export interface UserQueryParams extends PageQueryParams, DataScopeQueryParams {
  keyword?: string;
}

export interface UserRecord {
  id: string;
  username: string;
  nickname?: string | null;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserAssignedRole {
  id: string;
  name: string;
  code: string;
  sort: number;
  status: boolean;
}

export interface UserRoleAssignment {
  userId: string;
  username: string;
  nickname?: string | null;
  roleIds: string[];
  roles: UserAssignedRole[];
}

export interface CreateUserPayload {
  username: string;
  password: string;
  nickname?: string;
}

export interface UpdateUserPayload {
  username?: string;
  password?: string;
  nickname?: string;
}

export function getUserPageApi(params: UserQueryParams) {
  return request<UserQueryParams, PageResult<UserRecord>>({
    url: '/users',
    method: 'get',
    params: mergeDataScopeQueryParams(params)
  });
}

export function getUserDetailApi(id: string) {
  return request<never, UserRecord>({
    url: `/users/${id}`,
    method: 'get'
  });
}

export function createUserApi(data: CreateUserPayload) {
  return request<CreateUserPayload, UserRecord>({
    url: '/users',
    method: 'post',
    data
  });
}

export function updateUserApi(id: string, data: UpdateUserPayload) {
  return request<UpdateUserPayload, UserRecord>({
    url: `/users/${id}`,
    method: 'patch',
    data
  });
}

export function deleteUserApi(id: string) {
  return request<never, boolean>({
    url: `/users/${id}`,
    method: 'delete'
  });
}

export function getUserRolesApi(id: string) {
  return request<never, UserRoleAssignment>({
    url: `/users/${id}/roles`,
    method: 'get'
  });
}

export function assignUserRolesApi(id: string, roleIds: string[]) {
  return request<{ roleIds: string[] }, UserRoleAssignment>({
    url: `/users/${id}/roles`,
    method: 'put',
    data: { roleIds }
  });
}
