/**
 * 病例档案模块 API（中文注释）
 * 基于后端 @PostMapping("/medicalRecords/page")
 * - 入参 payload 由页面层构造（含分页与筛选）
 * - 返回统一分页结构 PageResponse<MedicalRecordItem>
 */
import request from '../http'
import type { PageResponse } from '../types'
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