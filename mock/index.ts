import type { MockMethod } from 'vite-plugin-mock';

import login from './auth/login';

export default [
  login
] as MockMethod[];
