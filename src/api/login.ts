import service from '../utils/request';

// 登录示例
export function loginApi<T extends object>(data: T) {
  return service({
    url: '/admin/login',
    method: 'POST',
    data
  });
}
