import type { MockMethod } from 'vite-plugin-mock';

import login from './auth/login';
import menuList from './auth/menuList';
import userList from './auth/userList';
import dictTree from './dict/frm.ts';
import dictPage from './dict/page.ts';

export default [
  login,
  menuList,
  dictTree,
  dictPage,
  userList
] as MockMethod[];
