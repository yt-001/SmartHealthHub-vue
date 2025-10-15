// 基于 axios 的请求工具（中文注释）
import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json;charset=UTF-8' },
  withCredentials: true // 跨域请求时发送 Cookie
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
        baseURL: service.defaults.baseURL,
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
  (response: AxiosResponse) => {
    // 成功：直接返回后端统一响应结构（code/msg/data）
    return response.data as any
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

    // 仅处理 401（或部分后端用 419/498 表示过期），且不是认证路径，且未重试过
    const isExpired = status === 401 || status === 419 || status === 498
    if (isExpired && originalRequest && !isAuthPath && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        await doRefresh()
        // 刷新成功：重试原请求
        return service.request(originalRequest)
      } catch (e) {
        // 刷新失败：清理用户状态，抛错
        try {
          const { useUserStore } = await import('@/stores/user')
          const store = useUserStore()
          store.clearUser?.()
        } catch {}
        return Promise.reject(e || error)
      }
    }

    // 其他情况：直接抛出
    return Promise.reject(error)
  }
)

export default service