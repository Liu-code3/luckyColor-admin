import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import sysConfig from '@/config';
import { clearLoginSession, getAccessToken } from '@/utils/auth';
import { message } from '@/utils/message.ts';
import { handlerError, reloadCodes } from '@/utils/http/config.ts';

// Avoid repeated messages and redirect loops when the session expires.
const loginBack = ref(false);

const redirectToLogin = () => {
  loginBack.value = true;
  clearLoginSession();
  message.warning('登录已失效，请重新登录');
  window.setTimeout(() => {
    if (window.location.pathname !== '/login')
      window.location.replace('/login');
    loginBack.value = false;
  }, 300);
};

export function setupInterceptors(axiosInstance: AxiosInstance) {
  function reqResolve(config: InternalAxiosRequestConfig) {
    const token = getAccessToken();

    if (token)
      config.headers[sysConfig.TOKEN_NAME] = sysConfig.TOKEN_PREFIX + token;

    if (!sysConfig.REQUEST_CACHE && config.method === 'get') {
      config.params = config.params || {};
      config.params._ = new Date().getTime();
    }
    Object.assign(config.headers, sysConfig.HEADERS);
    return config;
  }

  function reqReject(error: AxiosError) {
    return Promise.reject(error);
  }

  function resResolve(response: AxiosResponse) {
    const code: number = response.data.code;
    const data = response.data;
    const method = response.config.method?.toLowerCase();

    if (reloadCodes.includes(code)) {
      if (!loginBack.value)
        redirectToLogin();

      return Promise.reject(data);
    }

    if (code !== 200) {
      const customErrorMessage = response.config.data.msg;
      message.error(customErrorMessage || data.msg);
      return Promise.reject(response);
    }

    if (method && method !== 'get') {
      const msg = data.msg || '请求成功';
      message.success(msg);
    }

    return Promise.resolve(data);
  }

  function resReject(error: AxiosError) {
    if (error.response?.status === 401) {
      if (!loginBack.value)
        redirectToLogin();
      return Promise.reject(error);
    }

    if (error) {
      handlerError(error);
      return Promise.reject(error);
    }
  }

  axiosInstance.interceptors.request.use(reqResolve, reqReject);
  axiosInstance.interceptors.response.use(resResolve, resReject);
}
