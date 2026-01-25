/**
 * 病例档案模块 API（中文注释）
 * 基于后端 @PostMapping("/medicalRecords/page")
 * - 入参 payload 由页面层构造（含分页与筛选）
 * - 返回统一分页结构 PageResponse<MedicalRecordItem>
 */
import request from '../http'
import type { PageResponse, ApiResponse } from '../types'
import type { MedicalRecordItem } from '../types/medicalRecordTypes'

/**
 * 获取病例档案分页列表
 * @param payload 建议结构：
 * {
 *   pageNum, pageSize,
 *   sortField?: string, sortDirection?: 'ASC'|'DESC',
 *   query?: { realName?, visitNo?, deptId?, status?, visitDateStart?, visitDateEnd? }
 * }
 */
export const getMedicalRecordPage = (payload: any): Promise<ApiResponse<PageResponse<MedicalRecordItem>>> => {
  return request.post('/medicalRecords/page', payload) as Promise<ApiResponse<PageResponse<MedicalRecordItem>>>
}

export const medicalRecordApi = {
  getMedicalRecordPage
}

/**
 * 获取指定用户的病例列表（分页）
 * @param userId 用户ID
 * @param payload 分页与筛选参数
 */
/**
 * 根据患者ID获取全部病例历史（GET，无分页）
 * @param userId 患者ID
 * @returns 统一响应体，data 为病例历史列表
 */
export const getMedicalRecordsByUserId = (userId: string | number): Promise<ApiResponse<MedicalRecordItem[]>> => {
  return request.get(`/medicalRecords/user/${userId}`) as Promise<ApiResponse<MedicalRecordItem[]>>
}

/**
 * 创建病例档案
 * POST /medicalRecords/create
 */
export interface CreateMedicalRecordDTO {
  userId: string
  doctorId: string
  appointmentId?: string
  visitDate?: string
  symptoms?: string
  diagnosis?: string
  treatmentPlan?: string
  prescription?: string
  notes?: string
  status?: number
}

export const createMedicalRecord = (data: CreateMedicalRecordDTO): Promise<ApiResponse<any>> => {
  return request.post('/medicalRecords/create', data) as Promise<ApiResponse<any>>
}

/**
 * 根据ID获取病例详情
 * @param id 病例ID
 */
export const getMedicalRecordDetail = (id: string | number): Promise<ApiResponse<any>> => {
  return request.get(`/medicalRecords/${id}`) as Promise<ApiResponse<any>>
}
