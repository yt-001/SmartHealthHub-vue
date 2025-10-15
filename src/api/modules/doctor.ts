/**
 * 医生模块 API（中文注释）
 * 风格对齐现有 user.ts / health.ts：统一从 ../http 引入 request，返回强类型 Promise
 */
import request from '../http'
import type { PageParams, PageResponse } from '../types'
import type { DoctorItem, DoctorListParams } from '../types/doctorTypes'

/**
 * 获取医生分页列表
 * 约定后端路径：/admin/doctors
 * - 支持分页与筛选参数
 * - 返回 PageResponse<DoctorItem>
 */
export const getDoctorList = (params: DoctorListParams | PageParams): Promise<PageResponse<DoctorItem>> => {
  return request.get('/admin/doctors', { params })
}