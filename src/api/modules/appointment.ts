import request from '../http'
import { ApiResponse, PageResult, BasePageQuery } from '@/api/types'

export interface CreateAppointmentDTO {
  scheduleId: number
  patientId: number
  description?: string
  registrationNo?: string
}

export interface AppointmentItem {
  id: number
  scheduleId: number
  patientId: number
  status: number // 0:待确认, 1:已确认, 2:已完成, 3:已取消
  description: string
  registrationNo: string
  createdAt: string
  updatedAt: string
  // 关联信息（由后端DTO提供）
  doctorName?: string
  deptName?: string
  doctorTitle?: string
  specialty?: string
  scheduleDate?: string
  shiftCode?: string
  roomNo?: string
  maxAppoint?: number
  usedAppoint?: number
}

export interface AppointmentQuery extends BasePageQuery {
  patientId?: number
  status?: number
}

/**
 * 预约查询类（对接后端升级版本）
 */
export interface AppointmentQueryV2 {
  doctorId?: number
  patientId?: number
  status?: number // 0待确认 1已确认 2已就诊 3已取消
  startTime?: string
  endTime?: string
}

/**
 * 分页参数（对接后端 PageParam<AppointmentQuery> 结构）
 */
export interface AppointmentPageParam {
  pageNum: number
  pageSize: number
  query?: AppointmentQueryV2
}

/**
 * 1. 分页获取预约列表
 * POST /appointments/page
 */
export const fetchAppointmentList = async (params: AppointmentQuery): Promise<ApiResponse<PageResult<AppointmentItem>>> => {
  return request.post('/appointments/page', params) as Promise<ApiResponse<PageResult<AppointmentItem>>>
}

/**
 * 2. 根据ID获取预约详情
 * GET /appointments/{id}
 */
export const getAppointmentDetail = async (id: number): Promise<ApiResponse<AppointmentItem>> => {
  return request.get(`/appointments/${id}`) as Promise<ApiResponse<AppointmentItem>>
}

/**
 * 3. 根据患者ID获取预约列表
 * GET /appointments/patient/{patientId}
 */
export const getAppointmentsByPatient = async (patientId: number): Promise<ApiResponse<AppointmentItem[]>> => {
  return request.get(`/appointments/patient/${patientId}`) as Promise<ApiResponse<AppointmentItem[]>>
}

/**
 * 根据患者ID分页查询预约列表（升级版：支持条件查询）
 */
export const getAppointmentsByPatientPaged = async (patientId: number, param: AppointmentPageParam): Promise<ApiResponse<PageResult<AppointmentItem>>> => {
  // 后端要求 query 中也包含 patientId
  const payload: AppointmentPageParam = { ...param, query: { ...(param.query || {}), patientId } }
  return request.post(`/appointments/patient/${patientId}/page`, payload) as Promise<ApiResponse<PageResult<AppointmentItem>>>
}

/**
 * 根据医生ID分页查询预约列表（升级版：支持条件查询）
 */
export const getAppointmentsByDoctorPaged = async (doctorId: number, param: AppointmentPageParam): Promise<ApiResponse<PageResult<AppointmentItem>>> => {
  const payload: AppointmentPageParam = { ...param, query: { ...(param.query || {}), doctorId } }
  return request.post(`/appointments/doctor/${doctorId}/page`, payload) as Promise<ApiResponse<PageResult<AppointmentItem>>>
}

/**
 * 4. 根据医生排班ID获取预约列表
 * GET /appointments/schedule/{scheduleId}
 */
export const getAppointmentsBySchedule = async (scheduleId: number): Promise<ApiResponse<AppointmentItem[]>> => {
  return request.get(`/appointments/schedule/${scheduleId}`) as Promise<ApiResponse<AppointmentItem[]>>
}

/**
 * 5. 根据患者ID和排班ID查询预约 (校验用)
 * GET /appointments/patient/{patientId}/schedule/{scheduleId}
 */
// 后端未提供该接口，前端移除

/**
 * 6. 创建预约
 * POST /appointments/create
 */
export const createAppointment = async (data: CreateAppointmentDTO): Promise<ApiResponse<any>> => {
  return request.post('/appointments/create', data) as Promise<ApiResponse<any>>
}

/**
 * 7. 更新预约状态
 * PUT /appointments/{id}/status
 */
export const updateAppointmentStatus = async (id: number, status: number): Promise<ApiResponse<any>> => {
  return request.put(`/appointments/${id}/status`, null, {
    params: { status }
  }) as Promise<ApiResponse<any>>
}

/**
 * 8. 取消预约 (业务逻辑)
 * POST /appointments/cancel/{id}
 */
export const cancelAppointment = async (id: number): Promise<ApiResponse<any>> => {
  return request.post(`/appointments/cancel/${id}`) as Promise<ApiResponse<any>>
}

/**
 * 9. 删除预约 (物理删除)
 * DELETE /appointments/{id}
 */
export const deleteAppointment = async (id: number): Promise<ApiResponse<any>> => {
  return request.delete(`/appointments/${id}`) as Promise<ApiResponse<any>>
}
