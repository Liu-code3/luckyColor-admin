import service from '@/utils/request.ts';

export function getDictTreeApi() {
  return service({
    url: '/mock/dict/tree',
    method: 'get'
  });
}
