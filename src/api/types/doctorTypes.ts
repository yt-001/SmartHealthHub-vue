/**
 * 医生相关类型定义（中文注释）
 * 与后端约定字段名保持一致；如有出入请告知我同步调整
 */

export interface DoctorItem {
  /** 主键ID */
  id: number | string
  /** 工号 */
  jobNo?: string
  /** 姓名 */
  name: string
  /** 科室名称 */
  department?: string
  /** 职称 */
  title?: string
  /** 手机号 */
  phone?: string
  /** 状态：0=禁用 1=启用 */
  status?: 0 | 1
  /** 创建时间（ISO字符串或时间戳） */
  createdAt?: string | number
}

import type { BasePageQuery } from '../types'

export interface DoctorListParams extends BasePageQuery {
  /** 可选：按姓名/工号模糊搜索（继承自 BasePageQuery 的 keyword 也可用） */
  keyword?: string
  /** 可选：科室过滤 */
  department?: string
  /** 可选：状态过滤 */
  status?: 0 | 1
}