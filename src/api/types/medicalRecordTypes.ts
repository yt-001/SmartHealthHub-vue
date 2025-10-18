/**
 * 病例档案相关类型定义（中文注释）
 * 与后端 @Schema(description = "病例历史归档信息分页展示VO") 对齐
 */
import type { BasePageQuery } from '../types'

/** 列表项 VO：MedicalRecordPageVO */
export interface MedicalRecordItem {
  /** 病例ID */
  id: number
  /** 患者姓名 */
  patientName: string
  /** 医生姓名 */
  doctorName: string
  /** 诊断结果 */
  diagnosis: string
  /** 就诊日期（后端 LocalDateTime，前端按字符串接收） */
  visitDate: string
  /** 完成日期（后端 LocalDateTime，前端按字符串接收） */
  completedDate: string
  /** 状态：0 治疗中 1 已完成 2 已归档 */
  status: 0 | 1 | 2
}

/** 业务筛选字段（仅业务字段；公共时间范围 createdStart/createdEnd、updatedStart/updatedEnd 由 BaseQuery 提供） */
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

/** 分页查询参数：统一使用 BasePageQuery<T> 的 query 泛型承载业务条件 */
export type MedicalRecordListParams = BasePageQuery<MedicalRecordListFilter>