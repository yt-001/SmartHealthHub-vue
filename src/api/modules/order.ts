import request from '../http'
import type { ApiResponse, PageResponse } from '@/api/types'
import type { MedicineOrder, CreateOrderDTO, PayOrderDTO } from '@/api/types/orderTypes'

export const getOrderPage = (payload: any): Promise<ApiResponse<PageResponse<MedicineOrder>>> => {
  return request.post('/medicine-orders/page', payload) as Promise<ApiResponse<PageResponse<MedicineOrder>>>
}

export const createOrder = (data: CreateOrderDTO): Promise<ApiResponse<MedicineOrder>> => {
  return request.post('/medicine-orders/create', data) as Promise<ApiResponse<MedicineOrder>>
}

export const payOrder = (data: PayOrderDTO): Promise<ApiResponse<boolean>> => {
  return request.post('/medicine-orders/pay', data) as Promise<ApiResponse<boolean>>
}

export const getUserOrders = (userId: string | number): Promise<ApiResponse<MedicineOrder[]>> => {
  return request.get(`/medicine-orders/user/${userId}`) as Promise<ApiResponse<MedicineOrder[]>>
}
