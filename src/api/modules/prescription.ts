import request from '@/api/http'
import type { ApiResponse, PageResponse } from '@/api/types'

export interface PrescriptionItem {
  id: number
  medicalRecordId?: number
  userId: number
  doctorId: number
  patientName: string
  doctorName: string
  diagnosis?: string
  medicationDetails?: string
  notes?: string
  status: number // 0-待取药, 1-已完成, 2-已作废
  createdAt: string
  updatedAt: string
}

export interface PrescriptionQuery {
  patientName?: string
  doctorName?: string
  status?: number
  doctorId?: number
  userId?: number
}

export const prescriptionApi = {
  // 分页查询
  getPage(params: { pageNum: number; pageSize: number; query?: PrescriptionQuery }) {
    return request.post<any, ApiResponse<PageResponse<PrescriptionItem>>>('/prescriptions/page', params)
  },

  // 创建处方
  create(data: Partial<PrescriptionItem>) {
    return request.post<any, ApiResponse<string>>('/prescriptions/create', data)
  },

  // 更新处方
  update(data: Partial<PrescriptionItem>) {
    return request.post<any, ApiResponse<string>>('/prescriptions/update', data)
  },

  // 删除处方
  delete(id: number) {
    return request.post<any, ApiResponse<string>>(`/prescriptions/delete/${id}`)
  },

  // 获取详情
  getById(id: number) {
    return request.get<any, ApiResponse<PrescriptionItem>>(`/prescriptions/${id}`)
  }
}
