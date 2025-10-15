/**
 * 医生相关类型定义（中文注释）
 * 完全对齐后端 DoctorPageVO 字段
 */

export interface DoctorItem {
  /** 医生ID */
  id: number
  /** 登录账号 */
  username: string
  /** 真实姓名 */
  realName: string
  /** 手机号 */
  phone: string
  /** 邮箱 */
  email: string
  /** 职称 */
  title: string
  /** 科室ID */
  deptId: number
  /** 擅长领域 */
  specialty: string
  /** 执业证书编号 */
  qualificationNo: string
  /** 账号状态: 0正常 1锁定 2未激活 3已注销 */
  status: 0 | 1 | 2 | 3
  /** 创建时间 */
  createdAt: string
}

import type { BasePageQuery } from '../types'

/** 列表查询参数（可按需继续扩展，字段名与后端约定保持一致或在 API 层做转换） */
export interface DoctorListParams extends BasePageQuery {
  /** 关键字模糊搜索（对应 BaseQuery.keyword） */
  keyword?: string
  /** 创建时间（yyyy-MM-dd，对应 BaseQuery.createTime） */
  createTime?: string
  /** 更新时间（yyyy-MM-dd，对应 BaseQuery.updateTime） */
  updateTime?: string

  /** 用户名/登录账号 */
  username?: string
  /** 真实姓名 */
  realName?: string
  /** 手机号 */
  phone?: string
  /** 邮箱 */
  email?: string
  /** 职称 */
  title?: string
  /** 科室ID */
  deptId?: number
  /** 擅长领域 */
  specialty?: string
  /** 账号状态: 0正常 1锁定 2未激活 3已注销 */
  status?: 0 | 1 | 2 | 3
}