import request from '../http'
import type { ApiResponse } from '@/api/types'
import type { PharmacyLocation } from '@/api/types/pharmacyTypes'

export const getPharmacyLocations = (): Promise<ApiResponse<PharmacyLocation[]>> => {
  return request.get('/pharmacy-locations/list') as Promise<ApiResponse<PharmacyLocation[]>>
}
