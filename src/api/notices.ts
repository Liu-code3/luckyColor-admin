import { request } from '@/utils/http';
import { mergeDataScopeQueryParams } from '@/utils/data-scope';
import type { DataScopeQueryParams, PageQueryParams, PageResult } from './types';

export interface NoticeQueryParams extends PageQueryParams, DataScopeQueryParams {
  keyword?: string;
}

export interface NoticeRecord {
  id: string;
  title: string;
  content: string;
  type: string;
  status: boolean;
  publisher?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoticePayload {
  title: string;
  content: string;
  type: string;
  status?: boolean;
  publisher?: string;
  publishedAt?: string;
}

export interface UpdateNoticePayload {
  title?: string;
  content?: string;
  type?: string;
  status?: boolean;
  publisher?: string | null;
  publishedAt?: string | null;
}

export interface PublishNoticePayload {
  publisher?: string | null;
  scheduledPublishAt?: string | null;
  publishedAt?: string | null;
}

export function getNoticePageApi(params: NoticeQueryParams) {
  return request<NoticeQueryParams, PageResult<NoticeRecord>>({
    url: '/notices',
    method: 'get',
    params: mergeDataScopeQueryParams(params)
  });
}

export function getNoticeDetailApi(id: string) {
  return request<never, NoticeRecord>({
    url: `/notices/${id}`,
    method: 'get'
  });
}

export function createNoticeApi(data: CreateNoticePayload) {
  return request<CreateNoticePayload, NoticeRecord>({
    url: '/notices',
    method: 'post',
    data
  });
}

export function updateNoticeApi(id: string, data: UpdateNoticePayload) {
  return request<UpdateNoticePayload, NoticeRecord>({
    url: `/notices/${id}`,
    method: 'patch',
    data
  });
}

export function publishNoticeApi(id: string, data: PublishNoticePayload) {
  return request<PublishNoticePayload, NoticeRecord>({
    url: `/notices/${id}/publish`,
    method: 'patch',
    data
  });
}

export function revokeNoticeApi(id: string) {
  return request<never, NoticeRecord>({
    url: `/notices/${id}/revoke`,
    method: 'patch'
  });
}

export function deleteNoticeApi(id: string) {
  return request<never, boolean>({
    url: `/notices/${id}`,
    method: 'delete'
  });
}
