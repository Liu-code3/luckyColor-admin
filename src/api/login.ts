import { request } from '@/utils/http';

// 登录示例
export function loginApi<T>(data: T) {
  return request({
    url: '/auth/login',
    method: 'POST',
    data
  });
}

// 获取用户的菜单
export function menuListApi<T>(data: T) {
  return request({
    url: '/auth/menu-list',
    method: 'POST',
    data
  });
}
