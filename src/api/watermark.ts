import { request } from '@/utils/http';

export interface WatermarkConfigRecord {
  tenantId?: number | null;
  enabled: number;
  content: string;
  color: string;
  fontSize: number;
  opacityPercent: number;
  rotateDegree: number;
  gapX: number;
  gapY: number;
}

export interface WatermarkConfigPayload {
  enabled: number;
  content: string;
  color: string;
  fontSize: number;
  opacityPercent: number;
  rotateDegree: number;
  gapX: number;
  gapY: number;
}

export function getCurrentWatermarkConfigApi() {
  return request<never, WatermarkConfigRecord>({
    url: '/admin/watermark-config/current',
    method: 'get'
  });
}

export function saveCurrentWatermarkConfigApi(data: WatermarkConfigPayload) {
  return request<WatermarkConfigPayload, boolean>({
    url: '/admin/watermark-config/current',
    method: 'put',
    data
  });
}
