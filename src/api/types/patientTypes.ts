/**
 * 患者相关类型定义（中文注释）
 */
import type { BasePageQuery } from '../types'

export interface PatientItem {
  /** 患者ID */
  id: string
  /** 登录账号 */
  username: string
  /** 真实姓名 */
  realName: string
  /** 手机号 */
  phone: string
  /** 身份证号 */
  idCard: string
  /** 性别: M男 F女 O其他 */
  gender: 'M' | 'F' | 'O'
  /** 出生日期 */
  birthDate: string
  /** 血型 */
  bloodType: string
  /** 账号状态: 0正常 1锁定 2未激活 3已注销 */
  status: 0 | 1 | 2 | 3
  /** 创建时间 */
  createdAt: string
}

/** 列表筛选字段（仅业务字段，公共时间范围由 BaseQuery 提供） */
export interface PatientListFilter {
  /** 真实姓名 */
  realName?: string
  /** 手机号 */
  phone?: string
  /** 身份证号 */
  idCard?: string
  /** 性别: M男 F女 O其他 */
  gender?: 'M' | 'F' | 'O'
  /** 账号状态: 0正常 1锁定 2未激活 3已注销 */
  status?: 0 | 1 | 2 | 3
}

/** 列表查询参数（分页+排序+业务条件） */
export type PatientListParams = BasePageQuery<PatientListFilter>

/**
 * 患者认证审核相关类型
 */
export interface PatientAuthenticationDTO {
  /** 身份证号（格式校验由后端/表单负责，这里仅为字符串） */
  idCard: string
  /** 血型：A/B/AB/O/RH- */
  bloodType?: string
  /** 过敏史 */
  allergyHistory?: string
  /** 慢性病史 */
  chronicDisease?: string
  /** 当前主诉/症状 */
  currentSymptoms: string
  /** 正在执行的治疗方案 */
  currentPlan: string
  /** 下一步建议（检查/复诊/手术等） */
  nextStep: string
  /** 常住地址快照 JSON 字符串 */
  address?: string
  /** 紧急联系人姓名 */
  emergencyName?: string
  /** 紧急联系人电话 */
  emergencyPhone?: string
}

/** 认证列表项（用于表格展示） */
export interface PatientAuthListItem {
  /** 患者档案ID（后端 Long） */
  id: string
  /** 真实姓名 */
  realName: string
  /** 手机号 */
  phone: string
  /** 身份证号 */
  idCard: string
  /** 提交时间（后端 LocalDateTime -> 前端字符串） */
  createdAt: string
}

/** 患者认证审核筛选字段（仅业务字段；公共时间范围 createdStart/createdEnd、updatedStart/updatedEnd 由 BaseQuery 提供） */
export interface PatientAuthFilter {
  /** 真实姓名 */
  realName?: string
  /** 身份证号 */
  idCard?: string
}

/** 患者认证审核查询参数（分页+排序+业务条件） */
export type PatientAuthQuery = BasePageQuery<PatientAuthFilter>