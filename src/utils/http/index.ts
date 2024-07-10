import axios from 'axios';
import sysConfig from '@/config';
import { setupInterceptors } from '@/utils/http/interceptors.ts';

export function createAxios(options = {}) {
  const defaultOptions = {
    baseURL: <string>sysConfig.API_URL,
    timeout: sysConfig.TIMEOUT
  };

  const service = axios.create({
    ...defaultOptions,
    ...options
  });

  setupInterceptors(service);
  return service;
}

export const request = createAxios();
