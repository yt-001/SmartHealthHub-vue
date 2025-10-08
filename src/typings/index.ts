// 全局类型定义（中文注释）
export interface UserInfo {
  id: number
  username: string
  email: string
  avatar?: string
  role: string
}

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageParams {
  page: number
  pageSize: number
}

export interface PageResponse<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
}