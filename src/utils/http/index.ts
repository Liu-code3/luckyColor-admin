import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import sysConfig from '@/config';
import { setupInterceptors } from '@/utils/http/interceptors.ts';

export function createAxios(options: AxiosRequestConfig = {}) {
  const defaultOptions = {
    baseURL: sysConfig.API_URL,
    timeout: sysConfig.TIMEOUT,
    withCredentials: true
  };

  const service = axios.create({
    ...defaultOptions,
    ...options
  });

  setupInterceptors(service);
  return service;
}

const service = createAxios();

export function request<TPayload = unknown, TData = unknown>(config: AxiosRequestConfig<TPayload>) {
  return service.request<TData, AxiosResponse<TData>, TPayload>(config);
}
