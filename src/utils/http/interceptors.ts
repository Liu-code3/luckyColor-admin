import {
  CanceledError,
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios';
import sysConfig from '@/config';
import {
  clearLoginSession,
  getAccessToken,
  resolveTenantRequestHeaders
} from '@/utils/auth';
import { handlerError } from '@/utils/http/config.ts';
import { message } from '@/utils/message.ts';
import {
  isAccessTokenRecoverable,
  refreshAccessToken
} from '@/utils/http/session.ts';

const loginBack = ref(false);

function isSilentRequest(config?: {
  headers?: Record<string, unknown>;
}) {
  return config?.headers?.['x-silent-request'] === 'true';
}

function isLoginRequest(config: Pick<InternalAxiosRequestConfig, 'url'>) {
  return config.url?.includes('/auth/login');
}

function resolveRequestMessage(
  messageConfig: boolean | string | undefined,
  fallback = ''
) {
  if (messageConfig === false) {
    return '';
  }

  if (typeof messageConfig === 'string') {
    return messageConfig;
  }

  return fallback;
}

function resolveErrorCode(error: AxiosError) {
  const code = (error.response?.data as { code?: unknown } | undefined)?.code;
  return typeof code === 'number' ? code : null;
}

const redirectToLogin = (reason: 'expired' | 'invalid' = 'expired') => {
  loginBack.value = true;
  clearLoginSession(reason);
  message.warning('登录状态已失效，请重新登录');
  window.setTimeout(() => {
    if (window.location.pathname !== '/login')
      window.location.replace('/login');
    loginBack.value = false;
  }, 300);
};

export function setupInterceptors(axiosInstance: AxiosInstance) {
  function reqResolve(config: InternalAxiosRequestConfig) {
    const token = getAccessToken();

    if (!config.skipAuthHeader && token) {
      config.headers[sysConfig.TOKEN_NAME] = sysConfig.TOKEN_PREFIX + token;
    }

    if (!sysConfig.REQUEST_CACHE && config.method === 'get') {
      config.params = config.params || {};
      config.params._ = new Date().getTime();
    }

    Object.assign(config.headers, sysConfig.HEADERS, resolveTenantRequestHeaders());
    return config;
  }

  function reqReject(error: AxiosError) {
    return Promise.reject(error);
  }

  function resResolve(response: AxiosResponse) {
    const code: number = response.data.code;
    const data = response.data;
    const method = response.config.method?.toLowerCase();
    const silentRequest = isSilentRequest(response.config);

    if (code !== 200) {
      const customErrorMessage = resolveRequestMessage(
        response.config.showErrorMessage,
        data.msg || '请求失败'
      );
      if (!silentRequest)
        message.error(customErrorMessage);
      return Promise.reject(response);
    }

    if (!silentRequest && method && method !== 'get') {
      const msg = resolveRequestMessage(
        response.config.showSuccessMessage,
        data.msg || '请求成功'
      );

      if (msg) {
        message.success(msg);
      }
    }

    return Promise.resolve(data);
  }

  async function resReject(error: AxiosError) {
    const silentRequest = isSilentRequest(error.config);
    const errorCode = resolveErrorCode(error);

    if (
      error.response?.status === 401 &&
      error.config &&
      !error.config.skipAuthRefresh &&
      !error.config._authRetry &&
      !isLoginRequest(error.config) &&
      isAccessTokenRecoverable(errorCode)
    ) {
      const refreshedToken = await refreshAccessToken();

      if (refreshedToken) {
        error.config._authRetry = true;
        error.config.headers = error.config.headers || {};
        error.config.headers[sysConfig.TOKEN_NAME] =
          sysConfig.TOKEN_PREFIX + refreshedToken;
        return axiosInstance.request(error.config);
      }
    }

    if (error.response?.status === 401) {
      if (!loginBack.value && !isLoginRequest(error.config || { url: '' })) {
        redirectToLogin(errorCode === 1011007 ? 'expired' : 'invalid');
      }
      return Promise.reject(error);
    }

    if (error) {
      if (!silentRequest) {
        const customErrorMessage = resolveRequestMessage(error.config?.showErrorMessage);

        if (customErrorMessage) {
          message.error(customErrorMessage);
        }
        else {
          handlerError(error);
        }
      }
      return Promise.reject(error);
    }

    return Promise.reject(
      new CanceledError('Request canceled due to unknown interceptor state')
    );
  }

  axiosInstance.interceptors.request.use(reqResolve, reqReject);
  axiosInstance.interceptors.response.use(resResolve, resReject);
}
