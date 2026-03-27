import type { MockMethod } from 'vite-plugin-mock';

import captcha from './auth/captcha';
import login from './auth/login';
import menuList from './auth/menuList';
import profile from './auth/profile';
import dictTree from './dict/frm.ts';
import dictPage from './dict/page.ts';

export default [
  login,
  profile,
  menuList,
  ...captcha,
  dictTree,
  dictPage
] as MockMethod[];
