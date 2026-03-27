import type { MockMethod } from 'vite-plugin-mock';
import { buildMockMenuTree } from './shared';

const menuTreeMock: MockMethod = {
  url: '/api/menus/tree',
  method: 'get',
  response: () => ({
    code: 200,
    msg: '获取菜单成功',
    data: buildMockMenuTree()
  })
};

export default menuTreeMock;
