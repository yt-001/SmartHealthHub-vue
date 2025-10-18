/**
 * 医生相关类型定义（中文注释）
 * 目标：与新的 BasePageQuery<T> 查询基类对齐，所有业务筛选字段通过 query 泛型承载
 */

import type { BasePageQuery } from '../types'

/** 医生基础信息（列表项） */
export interface DoctorItem {
  /** 医生ID */
  id: number
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
  /** 资质认证状态 0 未通过 1 已通过 2 审核中 */
  qualificationVerified?: 0 | 1 | 2
  /** 账号状态: 0正常 1锁定 2未激活 3已注销 */
  status: 0 | 1 | 2 | 3
  /** 创建时间 */
  createdAt: string
}

/** 医生档案信息（医生个人详情展示 VO），与后端 DoctorProfilesVO 对齐 */
export interface DoctorProfilesVO {
  /** 真实姓名（部分接口会返回） */
  realName?: string
  /** 科室ID */
  deptId: number
  /** 职称 */
  title: string
  /** 擅长领域 */
  specialty: string
  /** 执业证书编号 */
  qualificationNo: string
  /** 个人简介 */
  bio: string
  /** 工作班次 */
  workShift: string
  /** 诊室编号 */
  officeRoom: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/** 医生列表筛选字段（仅业务字段，公共 createdAt/updatedAt 由 BaseQuery 提供） */
export interface DoctorListFilter {
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

/** 医生列表查询参数（分页+排序+业务条件统一由 query 承载） */
export type DoctorListParams = BasePageQuery<DoctorListFilter>

/** 认证列表项（用于表格展示） */
export interface DoctorAuthListItem {
  /** 医生档案ID（后端 Long） */
  id: number
  /** 真实姓名 */
  realName: string
  /** 手机号 */
  phone: string
  /** 职称 */
  title: string
  /** 科室ID */
  deptId: number
  /** 医师执业证号 */
  qualificationNo: string
  /** 提交时间（后端 LocalDateTime -> 前端字符串） */
  createdAt: string
}

/** 医生认证审核筛选字段（仅业务字段） */
export interface DoctorAuthFilter {
  /** 真实姓名（精确或模糊由后端决定） */
  realName?: string
  /** 医师执业证号（qualification_no） */
  qualificationNo?: string
}

/** 医生认证审核查询参数（分页+排序+业务条件） */
export type DoctorAuthQuery = BasePageQuery<DoctorAuthFilter>