// 基于 axios 的请求工具（中文注释）
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from '@/typings'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json;charset=UTF-8' }
})

// 请求拦截：附加 token
service.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
  return config
}, (error) => Promise.reject(error))

// 响应拦截：统一处理业务 code
service.interceptors.response.use((response: AxiosResponse<ApiResponse>) => {
  const { code, message, data } = response.data
  if (code === 200) return data
  ElMessage.error(message || '请求失败')
  return Promise.reject(new Error(message || '请求失败'))
}, (error) => {
  ElMessage.error(error.message || '网络错误')
  return Promise.reject(error)
})

export default service