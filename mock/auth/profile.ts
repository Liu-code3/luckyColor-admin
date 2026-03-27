import type { MockMethod } from 'vite-plugin-mock';
import { mockUserProfile } from './shared';

const profileMock: MockMethod = {
  url: '/api/auth/profile',
  method: 'get',
  response: () => ({
    code: 200,
    msg: '获取用户信息成功',
    data: {
      ...mockUserProfile,
      buttonCodeList: [],
      dataScopeType: 'ALL'
    }
  })
};

export default profileMock;
