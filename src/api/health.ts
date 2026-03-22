import { request } from '@/utils/http';

export interface HealthStatus {
  status: string;
  timestamp: string;
  database: string;
}

export function getHealthStatusApi() {
  return request<never, HealthStatus>({
    url: '/health',
    method: 'get'
  });
}
