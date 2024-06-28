import type { MockMethod } from 'vite-plugin-mock';

import login from './auth/login';
import menuList from './auth/menuList';
import dictTree from './dict/frm.ts';
import dictPage from './dict/page.ts';
import pageById from './dict/pageById.ts';

export default [
  login,
  menuList,
  dictTree,
  dictPage,
  pageById
] as MockMethod[];
