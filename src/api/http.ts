// 基于 axios 的请求工具（中文注释）
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'
import type { ApiResponse } from './types/index'

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json;charset=UTF-8' },
  withCredentials: true // 跨域请求时发送 Cookie
})

// 请求拦截：附加 token
/*
service.interceptors.request.use((config) => {
  // const token = localStorage.getItem('token') // 从 localStorage 读取 token 的方式已废弃
  // if (token && config.headers) {
  //   config.headers.Authorization = `Bearer ${token}`
  // }
  return config
}, (error) => Promise.reject(error))
*/

// 响应拦截：统一处理业务 code
service.interceptors.response.use((response: AxiosResponse<ApiResponse>) => {
  const { code, message, data } = response.data
  if (code === 200) {
    return data
  }
  ElMessage.error(message || '请求失败')
  return Promise.reject(new Error(message || '请求失败'))
}, (error) => {
  ElMessage.error(error.message || '网络错误')
  return Promise.reject(error)
})

export default service