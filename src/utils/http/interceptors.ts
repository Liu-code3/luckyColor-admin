import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import tool from '@/utils/tool.ts';
import sysConfig from '@/config';
import { message } from '@/utils/message.ts';
import { handlerError, reloadCodes } from '@/utils/http/config.ts';

// 定义一个重新登录弹出窗的变量
const loginBack = ref(false);

// 保持重新登录Modal的唯一性
const error = () => {
  loginBack.value = true;
  // 重新登陆提示弹窗
  loginBack.value = false;
};

export function setupInterceptors(axiosInstance: AxiosInstance) {
  function reqResolve(config: InternalAxiosRequestConfig) {
    const token = tool.data.get('TOKEN');

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

    if (reloadCodes.includes(code)) {
      if (!loginBack.value)
        error();

      return Promise.reject(data);
    }

    if (code !== 200) {
      const customErrorMessage = response.config.data.msg;
      message.error(customErrorMessage || data.msg);
      return Promise.reject(response);
    }
    else {
      // 请求成功
      const msg = data.msg || '请求成功';
      message.success(msg);
      return Promise.resolve(data);
    }
  }

  function resReject(error: AxiosError) {
    if (error) {
      handlerError(error);
      return Promise.reject(error);
    }
  }

  axiosInstance.interceptors.request.use(reqResolve, reqReject);
  axiosInstance.interceptors.response.use(resResolve, resReject);
}
