// 基于 axios 的请求工具（中文注释）
import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import JSONbig from 'json-bigint'

// 配置 json-bigint，将所有超长整型（bigint）解析为字符串，解决雪花ID精度丢失问题
const JSONbigString = JSONbig({ storeAsString: true })

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json;charset=UTF-8' },
  withCredentials: true, // 跨域请求时发送 Cookie
  // 添加响应转换器，在默认的 JSON.parse 前执行
  transformResponse: [
    (data) => {
      // 后端返回的是 JSON 字符串，在此用 json-bigint 进行解析
      if (typeof data === 'string' && data) {
        try {
          return JSONbigString.parse(data)
        } catch (e) {
          // 如果解析失败，返回原始数据，后续的拦截器可能会处理
          return data
        }
      }
      // 如果不是字符串（例如已经是对象了），直接返回
      return data
    }
  ]
})

/**
 * 认证策略（简单版）：
 * - 刷新令牌：后端通过 HttpOnly Cookie 管理，前端无需存储
 * - 成功响应：直接返回后端统一结构 code/msg/data，页面自行判断
 * - 401 时：尝试刷新一次，成功后重试原请求；失败则清理用户并抛出错误
 */

/**
 * 请求拦截（会话基于 Cookie，无需手动附加 Authorization）
 */
service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  return config
})

/**
 * 刷新令牌队列（基于 HttpOnly Cookie，无需携带 Authorization）
 * - 仅当出现 401 时触发 refresh，一次只发起一个刷新请求
 * - 其他失败状态码按原样抛出
 */
let refreshPromise: Promise<any> | null = null
const doRefresh = () => {
  if (!refreshPromise) {
    // 使用裸 axios 避免再次进入拦截器造成循环
    refreshPromise = axios.post(
      '/auth/refresh',
      {},
      {
        // 使用后端完整地址，确保命中 http://localhost:9000/auth/refresh
        baseURL: 'http://localhost:9000',
        withCredentials: true,
        headers: { 'Content-Type': 'application/json;charset=UTF-8' }
      }
    ).finally(() => {
      // 无论成功失败，都释放占位；失败时由调用方处理
      refreshPromise = null
    })
  }
  return refreshPromise
}

service.interceptors.response.use(
  async (response: AxiosResponse) => {
    // 成功：按统一响应结构 ApiResponse 读取业务码
    const data: any = response.data as any
    const url: string = response.config?.url || ''
    const isAuthPath =
      url.includes('/auth/refresh') ||
      url.includes('/auth/login') ||
      url.includes('/auth/logout')

    const code = data?.code
    // 通用规则：当业务码为 4001/4002（访问令牌无效/过期）时，触发刷新并重试一次原请求
    if ((code === 4001 || code === 4002) && !isAuthPath && !(response.config as any)?._retryByBusinessRefresh) {
      try {
        await doRefresh()
        const retryConfig: any = { ...response.config, _retryByBusinessRefresh: true }
        return service.request(retryConfig)
      } catch (e) {
        // 刷新失败：清理用户并抛出
        try {
          const { useUserStore } = await import('@/stores/user')
          const store = useUserStore()
          store.clearUser?.()
        } catch {}
        return Promise.reject(e)
      }
    }

    // 其他成功：直接返回 data
    return data as any
  },
  async (error) => {
    const status = error?.response?.status
    const originalRequest = error?.config as any

    // 若原请求不存在，或是刷新/登录/登出本身，直接抛出
    const url: string = originalRequest?.url || ''
    const isAuthPath =
      url.includes('/auth/refresh') ||
      url.includes('/auth/login') ||
      url.includes('/auth/logout')

    // 新规则：401 未授权 -> 引导用户重新登录，不再自动刷新
    if (status === 401 && !isAuthPath) {
      try {
        const { useUserStore } = await import('@/stores/user')
        const store = useUserStore()
        store.clearUser?.()
      } catch {}

      // 尝试导航到登录页（容错：根据项目导出方式获取 router）
      try {
        const routerMod: any = await import('@/router')
        const router = routerMod?.default || routerMod?.router || routerMod
        router?.push?.('/login')
      } catch {}

      return Promise.reject(error)
    }

    // 其他情况：直接抛出
    return Promise.reject(error)
  }
)

export default service