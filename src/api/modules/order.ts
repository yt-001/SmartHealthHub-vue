import request from '../http'
import type { ApiResponse } from '@/api/types'
import type { MedicineOrder, CreateOrderDTO, PayOrderDTO } from '@/api/types/orderTypes'

export const createOrder = (data: CreateOrderDTO): Promise<ApiResponse<MedicineOrder>> => {
  return request.post('/medicine-orders/create', data) as Promise<ApiResponse<MedicineOrder>>
}

export const payOrder = (data: PayOrderDTO): Promise<ApiResponse<boolean>> => {
  return request.post('/medicine-orders/pay', data) as Promise<ApiResponse<boolean>>
}

export const getUserOrders = (userId: string): Promise<ApiResponse<MedicineOrder[]>> => {
  return request.get(`/medicine-orders/list/${userId}`) as Promise<ApiResponse<MedicineOrder[]>>
}
