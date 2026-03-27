import {
  CanceledError,
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'
import sysConfig from '@/config'
import {
  clearLoginSession,
  getAccessToken,
  getUsableAccessToken,
  resolveTenantRequestHeaders
} from '@/utils/auth'
import { message } from '@/utils/message.ts'
import { handlerError, reloadCodes } from '@/utils/http/config.ts'

const loginBack = ref(false)

function isSilentRequest(config?: {
  headers?: Record<string, unknown>
}) {
  return config?.headers?.['x-silent-request'] === 'true'
}

function isLoginRequest(config: Pick<InternalAxiosRequestConfig, 'url'>) {
  return config.url?.includes('/auth/login')
}

function resolveRequestMessage(messageConfig: boolean | string | undefined, fallback = '') {
  if (messageConfig === false) {
    return ''
  }

  if (typeof messageConfig === 'string') {
    return messageConfig
  }

  return fallback
}

const redirectToLogin = () => {
  loginBack.value = true
  clearLoginSession('expired')
  message.warning('登录已失效，请重新登录')
  window.setTimeout(() => {
    if (window.location.pathname !== '/login')
      window.location.replace('/login')
    loginBack.value = false
  }, 300)
}

export function setupInterceptors(axiosInstance: AxiosInstance) {
  function reqResolve(config: InternalAxiosRequestConfig) {
    const storedToken = getAccessToken()
    const token = getUsableAccessToken()

    if (token)
      config.headers[sysConfig.TOKEN_NAME] = sysConfig.TOKEN_PREFIX + token
    else if (storedToken && !isLoginRequest(config)) {
      if (!loginBack.value)
        redirectToLogin()

      return Promise.reject(
        new CanceledError('Access token expired before request was sent')
      )
    }

    if (!sysConfig.REQUEST_CACHE && config.method === 'get') {
      config.params = config.params || {}
      config.params._ = new Date().getTime()
    }

    Object.assign(config.headers, sysConfig.HEADERS, resolveTenantRequestHeaders())
    return config
  }

  function reqReject(error: AxiosError) {
    return Promise.reject(error)
  }

  function resResolve(response: AxiosResponse) {
    const code: number = response.data.code
    const data = response.data
    const method = response.config.method?.toLowerCase()
    const silentRequest = isSilentRequest(response.config)

    if (reloadCodes.includes(code)) {
      if (!loginBack.value)
        redirectToLogin()

      return Promise.reject(data)
    }

    if (code !== 200) {
      const customErrorMessage = resolveRequestMessage(
        response.config.showErrorMessage,
        data.msg || '请求失败'
      )
      if (!silentRequest)
        message.error(customErrorMessage)
      return Promise.reject(response)
    }

    if (!silentRequest && method && method !== 'get') {
      const msg = resolveRequestMessage(
        response.config.showSuccessMessage,
        data.msg || '请求成功'
      )

      if (msg) {
        message.success(msg)
      }
    }

    return Promise.resolve(data)
  }

  function resReject(error: AxiosError) {
    const silentRequest = isSilentRequest(error.config)

    if (error.response?.status === 401) {
      if (!loginBack.value)
        redirectToLogin()
      return Promise.reject(error)
    }

    if (error) {
      if (!silentRequest) {
        const customErrorMessage = resolveRequestMessage(error.config?.showErrorMessage)

        if (customErrorMessage) {
          message.error(customErrorMessage)
        }
        else {
          handlerError(error)
        }
      }
      return Promise.reject(error)
    }
  }

  axiosInstance.interceptors.request.use(reqResolve, reqReject)
  axiosInstance.interceptors.response.use(resResolve, resReject)
}
