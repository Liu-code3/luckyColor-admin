import { request } from '@/utils/http';

export interface MenuQueryParams {
  page?: number;
  size?: number;
  title?: string;
}

export interface MenuRecord {
  pid?: number;
  parentId?: number | null;
  id: number;
  title: string;
  name: string;
  type: number;
  path: string;
  key?: string;
  menuKey?: string;
  icon?: string;
  layout?: string;
  isVisible?: boolean;
  component: string;
  redirect?: string | null;
  meta?: Record<string, unknown> | null;
  sort?: number;
  createdAt?: string;
  updatedAt?: string;
  children?: MenuRecord[];
}

export interface MenuPageData {
  total: number;
  current: number;
  size: number;
  records: MenuRecord[];
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
  component?: string;
  redirect?: string | null;
  meta?: Record<string, unknown> | null;
  sort?: number;
}

export function getMenuPageApi(params: MenuQueryParams) {
  return request<MenuQueryParams, MenuPageData>({
    url: '/menus',
    method: 'get',
    params
  });
}

export function getMenuTreeApi() {
  return request<never, MenuRecord[]>({
    url: '/menus/tree',
    method: 'get'
  });
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
