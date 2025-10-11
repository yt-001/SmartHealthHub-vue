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
 * 响应拦截（简单自动刷新）：
 * - 成功：返回 response.data
 * - 401：刷新一次并重试；失败抛错
 * - 其他错误：直接抛错
 */
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 成功：直接返回后端统一响应结构（code/msg/data）
    return response.data as any
  },
  async (error) => {
    const status = error?.response?.status
    const originalRequest = error?.config

    // 仅当 401 且未重试过时，执行一次刷新并重试
    if (status === 401 && originalRequest && !originalRequest._retry) {
      ;(originalRequest as any)._retry = true
      try {
        const { useUserStore } = await import('@/stores/user')
        const store = useUserStore()
        // 刷新令牌（基于 Cookie 会话），刷新成功后重试原请求
        await store.refreshAccessToken()
        return service.request(originalRequest)
      } catch {
        // 刷新失败：清理用户信息，让页面自行跳转登录或提示
        try {
          const { useUserStore } = await import('@/stores/user')
          const store = useUserStore()
          store.clearUser()
        } catch {}
        return Promise.reject(error)
      }
    }

    // 非 401 或已重试过：直接抛出错误，由页面决定展示
    return Promise.reject(error)
  }
)

export default service