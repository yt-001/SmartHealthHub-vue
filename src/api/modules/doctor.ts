/**
 * 医生模块 API（中文注释）
 * 风格对齐现有 user.ts / health.ts：统一从 ../http 引入 request，返回强类型 Promise
 */
import request from '../http'
import type { PageResponse } from '../types'
import type { DoctorItem } from '../types/doctorTypes'

/**
 * 获取医生分页列表
 * 约定后端路径：POST /admin/doctors/page
 * - 支持分页与筛选参数
 * - 返回 PageResponse<DoctorItem>
 */
/**
 * 获取医生分页列表（将前端查询参数统一转换为后端入参）
 * 前端：DoctorListParams { page, pageSize, keyword, deptId, title, status, createdRange }
 * 后端：{ pageNum, pageSize, keyword, deptId, title, status, createdStart, createdEnd }
 */
/**
 * 期望入参：已在页面层完成 page→pageNum 的字段映射与必要清理
 * 例如：{ pageNum, pageSize, keyword, title, deptId, status, ... }
 */
export const getDoctorList = (payload: any): Promise<PageResponse<DoctorItem>> => {
  return request.post('/admin/doctors/page', payload) as Promise<PageResponse<DoctorItem>>
}