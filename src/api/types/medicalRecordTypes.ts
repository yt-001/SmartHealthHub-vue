/**
 * 病例档案相关类型定义（中文注释）
 * 与后端 MedicalRecordDetailVO 对齐
 */
import type { BasePageQuery } from '../types'

/** 列表项/详情 VO：与后端 MedicalRecordDetailVO 完全对齐 */
export interface MedicalRecordItem {
  /** 病例编号 (Long -> string/number) */
  id?: string | number
  /** 患者姓名 (userName) */
  userName?: string
  /** 主治医生 (doctorName) */
  doctorName?: string
  /** 就诊时间 (visitDate) */
  visitDate?: string
  /** 患者主诉 (symptoms) */
  symptoms?: string
  /** 医生诊断 (diagnosis) */
  diagnosis?: string
  /** 治疗方案 (treatmentPlan) */
  treatmentPlan?: string
  /** 处方信息 (prescription) */
  prescription?: string
  /** 医生备注 (notes) */
  notes?: string
  /** 完成时间 (completedDate) */
  completedDate?: string
  /** 当前状态 (status) */
  status?: 0 | 1 | 2
  
  // --- 前端辅助/兼容字段 ---
  /** 患者ID (前端可能需要) */
  userId?: number
  /** 医生ID (前端可能需要) */
  doctorId?: number
  /** 兼容旧字段：患者姓名 */
  patientName?: string
}

/** 业务筛选字段 */
export interface MedicalRecordListFilter {
  /** 患者姓名 */
  patientName?: string
  /** 医生姓名 */
  doctorName?: string
  /** 状态：0 治疗中 1 已完成 2 已归档 */
  status?: 0 | 1 | 2
  /** 完成时间起始，格式：yyyy-MM-dd */
  completedStart?: string
  /** 完成时间结束，格式：yyyy-MM-dd */
  completedEnd?: string
  /** 就诊时间起始，格式：yyyy-MM-dd */
  visitStart?: string
  /** 就诊时间结束，格式：yyyy-MM-dd */
  visitEnd?: string

}

/** 分页查询参数 */
export type MedicalRecordListParams = BasePageQuery<MedicalRecordListFilter>
