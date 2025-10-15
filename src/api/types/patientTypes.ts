/**
 * 患者相关类型定义（中文注释）
 */
import type { BasePageQuery } from '../types'

export interface PatientItem {
  /** 患者ID */
  id: number
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

/** 列表查询参数 */
export interface PatientListParams extends BasePageQuery {
  /** 真实姓名 */
  realName?: string
  /** 手机号 */
  phone?: string
  /** 性别 */
  gender?: 'M' | 'F'
  /** 账号状态 */
  status?: 0 | 1
}