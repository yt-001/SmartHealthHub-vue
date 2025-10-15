/**
 * 患者模块 API（中文注释）
 */
import request from '../http'
import type { PageResponse } from '../types'
import type { PatientItem } from '../types/patientTypes'

/**
 * 获取患者分页列表
 * @param payload 已经过页面层组装的查询参数
 * 结构: { pageNum, pageSize, query: { realName, phone, gender, status, ... } }
 */
export const getPatientList = (payload: any): Promise<PageResponse<PatientItem>> => {
  return request.post('/admin/patients/page', payload) as Promise<PageResponse<PatientItem>>
}

export const patientApi = {
  getPatientList
}