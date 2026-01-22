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

/**
 * 获取患者基本信息（根据ID）
 * @param id 患者ID
 */
export const getPatientById = (id: string | number): Promise<ApiResponse<PatientItem>> => {
  return request.get(`/admin/patients/${id}`) as Promise<ApiResponse<PatientItem>>
}

/**
 * 根据用户ID获取患者档案信息
 * @param userId 用户ID
 */
export const getPatientProfileByUserId = (userId: string | number): Promise<ApiResponse<PatientAuthenticationDTO>> => {
  return request.get(`/user/profiles/user/${userId}`) as Promise<ApiResponse<PatientAuthenticationDTO>>
}

/**
 * 保存或更新患者档案信息
 * @param userId 用户ID
 * @param data 档案数据
 */
export const savePatientProfile = (userId: string | number, data: Partial<PatientAuthenticationDTO>): Promise<ApiResponse<string>> => {
  return request.post(`/user/profiles/user/${userId}`, data) as Promise<ApiResponse<string>>
}

export const patientApi = {
  getPatientList,
  getPatientById,
  getPatientProfileByUserId,
  savePatientProfile
}