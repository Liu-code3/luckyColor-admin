import { request } from '@/utils/http';

export function getDictTreeApi() {
  return request({
    url: '/mock/dict/tree',
    method: 'get'
  });
}
