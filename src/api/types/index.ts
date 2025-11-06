/**
 * API 通用类型定义（企业常见写法，中文注释）
 * - 统一响应结构 ApiResponse<T>
 * - 分页查询基类 BasePageQuery（供各业务查询入参继承）
 * - 分页结果基类 PageResult<T>
 * - 为兼容现有模块，保留 PageParams / PageResponse 的导出别名
 */

/** 基础查询（可扩展公共筛选字段，使用范围式命名） */
export interface BaseQuery {
  /** 创建时间起始（yyyy-MM-dd） */
  createdStart?: string
  /** 创建时间结束（yyyy-MM-dd） */
  createdEnd?: string
  /** 更新时间起始（yyyy-MM-dd） */
  updatedStart?: string
  /** 更新时间结束（yyyy-MM-dd） */
  updatedEnd?: string
}

/** 分页查询基础类（与后端 PageParam 对齐：pageNum/pageSize/sort/query） */
export interface BasePageQuery<T = any> {
  /*---------- 分页必备 ----------*/
  /** 第几页（从1开始，前端友好） */
  pageNum: number
  /** 每页条数 */
  pageSize: number

  /*---------- 排序 ----------*/
  /** 排序字段（可选） */
  sortField?: string
  /** 排序方向（与后端 Sort.Direction 一致，默认 DESC） */
  sortDirection?: 'ASC' | 'DESC'

  /*---------- 业务条件 ----------*/
  /** 真正的查询条件，泛型隔离 */
  query?: BaseQuery & T
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
export type ID = string

/**
 * 兼容导出别名（保持对旧代码/示例的兼容，不破坏现有 import）
 * - PageParams 等价于 BasePageQuery
 * - PageResponse<T> 等价于 PageResult<T>
 */
export type PageParams = BasePageQuery<any>
export type PageResponse<T = any> = PageResult<T>