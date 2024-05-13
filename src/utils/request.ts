// 统一的请求发送
import axios, { AxiosError } from 'axios'
import sysConfig from '@/config/index'
import tool from '@/utils/tool'
import { createDiscreteApi } from 'naive-ui'
import { ref } from 'vue'
//为Naive UI组件创建离散的API
const { message } = createDiscreteApi(['message'])

// 以下这些code需要重新登录
const reloadCodes: number[] = [401, 1011007, 1011008]
const errorCodeMap: { [key: number]: string } = {
  400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
  401: '用户没有权限（令牌、用户名、密码错误）。',
  403: '用户得到授权，但是访问是被禁止的。',
  404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
  406: '请求的格式不可得。',
  410: '请求的资源被永久删除，且不会再得到的。',
  422: '当创建一个对象时，发生一个验证错误。',
  500: '服务器发生错误，请检查服务器。',
  502: '网关错误。',
  503: '服务不可用，服务器暂时过载或维护。',
  504: '网关超时。',
}

// 定义一个重新登录弹出窗的变量
const loginBack = ref(false)

// 创建 axios 实例
const service = axios.create({
  baseURL: '/api', // api base_url
  timeout: sysConfig.TIMEOUT, // 请求超时时间
})

// HTTP request 拦截器
service.interceptors.request.use(
  (config) => {
    const token = tool.data.get('TOKEN')
    if (token) {
      config.headers[sysConfig.TOKEN_NAME] = sysConfig.TOKEN_PREFIX + token
    }
    if (!sysConfig.REQUEST_CACHE && config.method === 'get') {
      config.params = config.params || {}
      config.params._ = new Date().getTime()
    }
    Object.assign(config.headers, sysConfig.HEADERS)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 保持重新登录Modal的唯一性
const error = () => {
  loginBack.value = true
  console.log('登录已失效， 请重新登录')
  loginBack.value = false

  window.location.reload()
}

//响应拦截
service.interceptors.response.use(
  (res) => {
    const code = res.data.code
    const data = res.data

    if (reloadCodes.includes(code)) {
      if (!loginBack.value) {
        error()
      }
      return Promise.reject(res)
    }

    if (code !== 200) {
      const customErrorMessage = res.config.data.msg
      message.error(customErrorMessage || data.msg)
      return Promise.reject(res)
    } else {
      //请求成功
      message.success(data.msg)
      return Promise.resolve(res.data)
    }
  },
  (error) => {
    if (error) {
      handlerError(error)
      return Promise.reject(error)
    }
  }
)

function handlerError(error: AxiosError) {
  const status = error.response && error.response.status
  const description = status && errorCodeMap[status]
  message.error(description + '请求错误', { duration: 3000 })
}

export default service
