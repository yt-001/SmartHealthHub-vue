/**
 * 患者模块 API（中文注释）
 */
import request from '../http'
import type { PageResponse } from '../types'
import type { PatientItem, PatientAuthenticationDTO } from '../types/patientTypes'
import type { ApiResponse } from '@/api/types'

/**
 * 获取患者分页列表
 * @param payload 已经过页面层组装的查询参数
 * 结构: { pageNum, pageSize, query: { realName, phone, gender, status, ... } }
 */
export const getPatientList = (payload: any): Promise<PageResponse<PatientItem>> => {
  return request.post('/admin/patients/page', payload) as Promise<PageResponse<PatientItem>>
}

/** 获取单个患者认证审核详情（GET） */
export function fetchPatientAuthDetail(id: string) {
  return request.get(`/user/profiles/${id}`) as Promise<ApiResponse<PatientAuthenticationDTO>>
}

export const patientApi = {
  getPatientList
}