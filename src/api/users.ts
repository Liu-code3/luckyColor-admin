import { request } from '@/utils/http';

export interface UserQueryParams {
  page?: number;
  size?: number;
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

export interface UserPageData {
  total: number;
  current: number;
  size: number;
  records: UserRecord[];
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
  return request<UserQueryParams, UserPageData>({
    url: '/users',
    method: 'get',
    params
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
