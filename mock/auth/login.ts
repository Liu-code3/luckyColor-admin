import type { MockMethod } from 'vite-plugin-mock';
import { createMockAccessToken, mockUserProfile } from './shared';

const loginMock: MockMethod = {
  url: '/api/auth/login',
  method: 'post',
  response: ({ body }) => {
    const username = String(body?.username ?? '').trim();
    const password = String(body?.password ?? '');

    if (username !== mockUserProfile.username || password !== '123456') {
      return {
        code: 400,
        msg: '用户名或密码错误',
        data: null
      };
    }

    return {
      code: 200,
      msg: '登录成功',
      data: {
        accessToken: createMockAccessToken(username),
        tokenType: 'Bearer',
        expiresIn: '7200',
        dataScopeType: 'ALL',
        user: {
          ...mockUserProfile,
          buttonCodeList: []
        }
      }
    };
  }
};

export default loginMock;
