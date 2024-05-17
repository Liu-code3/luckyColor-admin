import type { MockMethod } from 'vite-plugin-mock';

import login from './auth/login';
import menuList from './auth/menuList';

export default [
  login,
  menuList
] as MockMethod[];
