import { request } from '@/utils/http';
import { normalizeMenuTree } from '@/utils/menu-normalizer';
import type { PageQueryParams, PageResult } from './types';

export interface MenuQueryParams extends PageQueryParams {
  title?: string;
}

export interface MenuRecord {
  pid?: number;
  parentId?: number | null;
  id: number;
  tenantId?: string | null;
  tenantName?: string | null;
  title: string;
  name: string;
  type: number;
  path: string;
  key?: string;
  menuKey?: string;
  icon?: string;
  layout?: string;
  isVisible?: boolean;
  status?: boolean;
  component: string;
  redirect?: string | null;
  meta?: Record<string, unknown> | null;
  sort?: number;
  createdAt?: string;
  updatedAt?: string;
  children?: MenuRecord[];
}

export interface CreateMenuPayload {
  id?: number;
  parentId?: number | null;
  title: string;
  name: string;
  type: number;
  path: string;
  menuKey: string;
  icon?: string;
  layout?: string;
  isVisible?: boolean;
  status?: boolean;
  component: string;
  redirect?: string;
  meta?: Record<string, unknown>;
  sort?: number;
}

export interface UpdateMenuPayload {
  parentId?: number | null;
  title?: string;
  name?: string;
  type?: number;
  path?: string;
  menuKey?: string;
  icon?: string;
  layout?: string;
  isVisible?: boolean;
  status?: boolean;
  component?: string;
  redirect?: string | null;
  meta?: Record<string, unknown> | null;
  sort?: number;
}

export function getMenuPageApi(params: MenuQueryParams) {
  return request<MenuQueryParams, PageResult<MenuRecord>>({
    url: '/menus',
    method: 'get',
    params
  });
}

export async function getMenuTreeApi() {
  const response = await request<never, MenuRecord[]>({
    url: '/menus/tree',
    method: 'get'
  });

  return {
    ...response,
    data: normalizeMenuTree(response.data)
  };
}

export function getMenuDetailApi(id: number) {
  return request<never, MenuRecord>({
    url: `/menus/${id}`,
    method: 'get'
  });
}

export function createMenuApi(data: CreateMenuPayload) {
  return request<CreateMenuPayload, MenuRecord>({
    url: '/menus',
    method: 'post',
    data
  });
}

export function updateMenuApi(id: number, data: UpdateMenuPayload) {
  return request<UpdateMenuPayload, MenuRecord>({
    url: `/menus/${id}`,
    method: 'patch',
    data
  });
}

export function deleteMenuApi(id: number) {
  return request<never, boolean>({
    url: `/menus/${id}`,
    method: 'delete'
  });
}
