/**
 * 医生模块 API（中文注释）
 * 风格对齐现有 user.ts / health.ts：统一从 ../http 引入 request，返回强类型 Promise
 */
import request from '../http'
import type { PageResponse } from '../types'
import type { DoctorItem } from '../types/doctorTypes'
import type { ApiResponse } from '@/api/types'
import type { DoctorProfilesVO } from '@/api/types/doctorTypes'

/**
 * 期望入参：已在页面层完成 page→pageNum 的字段映射与必要清理
 * 例如：{ pageNum, pageSize, title, deptId, status, ... }
 */
export const getDoctorList = (payload: any): Promise<PageResponse<DoctorItem>> => {
  return request.post('/admin/doctors/page', payload) as Promise<PageResponse<DoctorItem>>
}

/**
 * 获取当前医生档案信息（占位路径，后端确定后可调整）
 * 默认返回 DoctorProfilesVO
 */
export const getDoctorProfile = async (userId: number): Promise<ApiResponse<DoctorProfilesVO>> => {
  // 实际接口：GET /doctor/profiles/{userId}
  return request.get(`/doctor/profiles/user/${userId}`) as Promise<ApiResponse<DoctorProfilesVO>>
}


/**
 * 获取当前医生档案信息,传递医生id（占位路径，后端确定后可调整）
 * 默认返回 DoctorProfilesVO
 */
export const getDoctorProfileId = async (userId: number): Promise<ApiResponse<DoctorProfilesVO>> => {
  // 实际接口：GET /doctor/profiles/{userId}
  return request.get(`/doctor/profiles/${userId}`) as Promise<ApiResponse<DoctorProfilesVO>>
}
