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
export const getMedicalRecordPage = (payload: any): Promise<PageResponse<MedicalRecordItem>> => {
  return request.post('/admin/medicalRecords/page', payload) as Promise<PageResponse<MedicalRecordItem>>
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
