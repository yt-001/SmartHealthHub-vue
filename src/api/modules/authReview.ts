/**
 * 认证审核相关接口（中文注释）
 * 注意：当前接口路径均为占位符，请根据后端真实路径调整
 */
import request from '../http'
import type { ApiResponse, PageResult } from '../types'
import type {
  DoctorAuthListItem,
  DoctorAuthQuery
} from '../types/doctorTypes'
import type {
  PatientAuthListItem,
  PatientAuthQuery
} from '../types/patientTypes'

/** 获取医生认证审核列表（分页） */
export function fetchDoctorAuthList(params: DoctorAuthQuery) {
  // 中文注释：直接传递查询对象，确保后端能收到 realName/qualificationNo/createdAt/updatedAt 等字段
  return request.post('/admin/verification/doctors/pending', params) as Promise<ApiResponse<PageResult<DoctorAuthListItem>>>
}

/** 获取患者认证审核列表（分页） */
export function fetchPatientAuthList(params: PatientAuthQuery) {
  // 中文注释：直接传递查询对象，确保后端能收到 realName/idCard/createdAt/updatedAt 等字段
  return request.post('/admin/verification/patients/pending', params) as Promise<ApiResponse<PageResult<PatientAuthListItem>>>
}

/** 审核操作：医生通过/驳回（PUT + 查询参数 status：1=通过，0=驳回） */
export function approveDoctorAuth(id: string | number, status: 0 | 1) {
  return request.put(`/admin/verification/doctors/${id}/verify`, null, { params: { status } }) as Promise<ApiResponse<void>>
}

/** 审核操作：患者通过/驳回（PUT + 查询参数 status：1=通过，0=驳回） */
export function approvePatientAuth(id: string | number, status: 0 | 1) {
  return request.put(`/admin/verification/patients/${id}/verify`, null, { params: { status } }) as Promise<ApiResponse<void>>
}