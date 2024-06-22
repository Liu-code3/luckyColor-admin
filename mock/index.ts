import type { MockMethod } from 'vite-plugin-mock';

import login from './auth/login';
import menuList from './auth/menuList';
import dictTree from './dict/frm.ts';

export default [
  login,
  menuList,
  dictTree
] as MockMethod[];
