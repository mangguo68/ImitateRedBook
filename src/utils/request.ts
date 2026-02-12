import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

// 创建axios实例
const service: AxiosInstance = axios.create({
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
})

// 存储刷新token的Promise，用于处理并发请求
let refreshTokenPromise: Promise<any> | null = null

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 可以在这里添加token等认证信息
    const accessToken = localStorage.getItem('accessToken')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    // 记录请求开始时间
    ;(config as any).startTime = Date.now()
    return config
  },
  (error: any) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 计算请求耗时
    const startTime = (response.config as any).startTime
    const requestTime = startTime ? Date.now() - startTime : 0

    // 最小请求时间500ms
    const minRequestTime = 500
    const delay = Math.max(0, minRequestTime - requestTime)

    // 如果需要延迟，返回一个Promise
    if (delay > 0) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const res = response.data
          // 如果后端返回的是标准格式 { success: true, data: ... }
          if (res && res.success !== undefined) {
            if (res.success) {
              resolve(res.data || res)
            } else {
              // 处理业务错误
              console.error('Business error:', res.message)
              Promise.reject(new Error(res.message || 'Error'))
            }
          } else {
            // 如果不是标准格式，直接返回数据
            resolve(res)
          }
        }, delay)
      })
    }

    // 不需要延迟，直接处理响应
    const res = response.data
    // 如果后端返回的是标准格式 { success: true, data: ... }
    if (res && res.success !== undefined) {
      if (res.success) {
        return res.data || res
      } else {
        // 处理业务错误
        console.error('Business error:', res.message)
        return Promise.reject(new Error(res.message || 'Error'))
      }
    }
    // 如果不是标准格式，直接返回数据
    return res
  },
  async (error: any) => {
    // 计算请求耗时
    const startTime = (error.config as any)?.startTime
    const requestTime = startTime ? Date.now() - startTime : 0

    // 最小请求时间500ms
    const minRequestTime = 500
    const delay = Math.max(0, minRequestTime - requestTime)

    // 处理网络错误
    if (error.response) {
      // 服务器响应了错误状态码
      const status = error.response.status
      const errorData = error.response.data

      switch (status) {
        case 400:
          // 400状态码，保留后端返回的错误信息
          console.error('请求错误:', errorData.message || '请求参数错误')
          break
        case 401:
          // 未授权，处理token过期问题
          console.error('未授权，请重新登录')
          error.isUnauthorized = true // 标记为未授权错误
          // 保留后端返回的错误信息
          error.message = error.response.data.message || '未授权，请重新登录'

          // 处理token过期，自动刷新并重新请求
          const originalConfig = error.config

          // 避免重复刷新token
          if (!originalConfig._retry) {
            originalConfig._retry = true

            try {
              // 检查是否已经有刷新token的请求
              if (!refreshTokenPromise) {
                const refreshToken = localStorage.getItem('refreshToken')
                if (!refreshToken) {
                  // 没有refresh token，直接返回错误
                  return Promise.reject(error)
                }

                // 发起刷新token的请求
                refreshTokenPromise = service.post('/api/auth/refresh', { refreshToken })
              }

              // 等待刷新token完成
              const refreshResult = await refreshTokenPromise

              // 更新本地存储的token
              if (refreshResult.accessToken && refreshResult.refreshToken) {
                localStorage.setItem('accessToken', refreshResult.accessToken)
                localStorage.setItem('refreshToken', refreshResult.refreshToken)

                // 更新当前请求的Authorization头
                service.defaults.headers.common.Authorization = `Bearer ${refreshResult.accessToken}`
                originalConfig.headers.Authorization = `Bearer ${refreshResult.accessToken}`

                // 清除刷新token的Promise
                refreshTokenPromise = null

                // 重新发起之前失败的请求
                return service(originalConfig)
              }
            } catch (refreshError: any) {
              // 刷新token失败，清除认证状态
              console.error('刷新token失败:', refreshError)
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
              localStorage.removeItem('userInfo')

              // 清除刷新token的Promise
              refreshTokenPromise = null

              // 跳转到登录页或提示用户重新登录
              // 这里可以根据需要添加跳转逻辑
            }
          }

          break
        case 403:
          console.error('没有权限')
          break
        case 404:
          console.error('请求的资源不存在')
          break
        case 500:
          console.error('服务器内部错误')
          break
        default:
          console.error(`请求失败: ${status}`)
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误，请检查网络连接')
    } else {
      // 其他错误
      console.error('请求配置错误')
    }

    // 如果需要延迟，返回一个Promise
    if (delay > 0) {
      return new Promise((_, reject) => {
        setTimeout(() => {
          reject(error)
        }, delay)
      })
    }

    return Promise.reject(error)
  },
)

export default service
