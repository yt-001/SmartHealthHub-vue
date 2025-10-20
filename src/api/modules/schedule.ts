/**
 * 排班与节假日模块 API（中文注释，风格统一）
 * - 统一使用 ../http 的 request
 * - 返回统一响应结构 ApiResponse<T>
 * - 节假日仅读取本地 JSON 资产，不请求后端
 */

import request from '../http'
import type { ApiResponse } from '@/api/types'
import type { HolidayItem, DoctorScheduleItem } from '@/api/types/scheduleTypes'
import type { DoctorScheduleCalendarQuery } from '@/api/types/scheduleTypes'

/**
 * 获取某月节假日列表（仅本地 JSON）
 * 数据源：src/assets/holidays-2025-09_2026-06.json
 * 入参：month（YYYY-MM）
 * 返回：ApiResponse<HolidayItem[]>
 */
export const fetchHolidays = async (month: string): Promise<ApiResponse<HolidayItem[]>> => {
  try {
    // 仅从本地资产读取（Vite/webpack 支持 JSON 直接导入）
    const mod = await import('@/assets/holidays-2025-09_2026-06.json')
    const dataMap = (mod.default || mod) as Record<string, HolidayItem[]>
    const list = dataMap[month] || []
    return {
      code: 200,
      msg: '成功',
      data: list
    }
  } catch {
    // 兜底：读取失败返回空
    return {
      code: 200,
      msg: '成功',
      data: []
    }
  }
}

/**
 * 获取某月医生排班（日历用）
 * 路径：GET /schedule/calendar?month=YYYY-MM
 */
export const fetchScheduleCalendar = (month: string): Promise<ApiResponse<DoctorScheduleItem[]>> => {
  return request.get('/schedule/calendar', { params: { month } }) as Promise<ApiResponse<DoctorScheduleItem[]>>
}

/**
 * 中文注释：按时间范围查询医生排班（日历用）
 * 入参：DoctorScheduleCalendarQuery（startDate/endDate/doctorId/deptId）
 * 协议：GET /schedule/calendar（通过查询参数传递）
 * 返回：ApiResponse<DoctorScheduleItem[]>
 */
export const fetchScheduleCalendarByRange = (query: DoctorScheduleCalendarQuery): Promise<ApiResponse<DoctorScheduleItem[]>> => {
  // 将可选字段作为查询参数传入
  return request.post('/schedule/calendar', { params: query }) as Promise<ApiResponse<DoctorScheduleItem[]>>
}

/** 聚合导出（与其它模块保持一致） */
export const scheduleApi = {
  fetchHolidays,
  fetchScheduleCalendar,
  fetchScheduleCalendarByRange
}