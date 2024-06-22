import service from '../utils/request';

// 登录示例
export function loginApi<T>(data: T) {
  return service({
    url: '/mock/login',
    method: 'POST',
    data
  });
}

// 获取用户的菜单
export function menuListApi<T>(data: T) {
  return service({
    url: '/mock/menuList',
    method: 'POST',
    data
  });
}
