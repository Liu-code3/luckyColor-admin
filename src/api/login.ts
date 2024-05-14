import service from '../utils/request';

// 登录示例
export function loginApi<T>(data: T) {
  return service({
    url: '/mock/login',
    method: 'POST',
    data
  });
}
