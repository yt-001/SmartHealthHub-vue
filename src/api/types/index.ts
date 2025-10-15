/**
 * API 通用类型定义（企业常见写法，中文注释）
 * - 统一响应结构 ApiResponse<T>
 * - 分页查询基类 BasePageQuery（供各业务查询入参继承）
 * - 分页结果基类 PageResult<T>
 * - 为兼容现有模块，保留 PageParams / PageResponse 的导出别名
 */

/** 基础查询（可扩展公共筛选字段） */
export interface BaseQuery {
  /** 关键字（可选，约定为通用模糊匹配字段名） */
  keyword?: string
  /** 起始时间（可选，ISO 字符串或时间戳） */
  beginTime?: string | number
  /** 结束时间（可选，ISO 字符串或时间戳） */
  endTime?: string | number
}

/** 分页查询基础类（业务查询入参建议继承它） */
export interface BasePageQuery extends BaseQuery {
  /** 页码，从 1 开始 */
  page: number
  /** 每页条数 */
  pageSize: number
  /** 排序字段（可选） */
  sortField?: string
  /** 排序方向（可选） */
  sortOrder?: 'asc' | 'desc'
}

/** 统一响应结构（与后端约定：code/msg/data） */
export interface ApiResponse<T = any> {
  code: number
  /** 后端返回消息字段为 msg，保持一致 */
  msg: string
  data: T
}

/** 分页结果基类（列表返回体统一使用它） */
export interface PageResult<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** 常用工具类型 */
export type Nullable<T> = T | null
export type ID = number | string

/**
 * 兼容导出别名（保持对旧代码/示例的兼容，不破坏现有 import）
 * - PageParams 等价于 BasePageQuery
 * - PageResponse<T> 等价于 PageResult<T>
 */
export type PageParams = BasePageQuery
export type PageResponse<T = any> = PageResult<T>