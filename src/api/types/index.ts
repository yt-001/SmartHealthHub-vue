// API 相关类型定义（中文注释）

/**
 * API 响应体结构
 */
export interface ApiResponse<T = any> {
  code: number
  /** 后端返回的消息字段为 msg，保持与后端一致 */
  msg: string
  data: T
}

/**
 * 分页查询参数
 */
export interface PageParams {
  page: number
  pageSize: number
}

/**
 * 分页响应数据
 */
export interface PageResponse<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
}