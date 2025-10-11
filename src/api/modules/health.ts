import request from '../http'
import type { PageParams, PageResponse } from '../types/index'

/**
 * 获取健康数据列表接口
 * @param params 分页参数
 * @returns Promise，解析后为分页响应数据
 */
export const getHealthDataList = (params: PageParams): Promise<PageResponse> => {
  return request.get('/health/data', { params })
}

/**
 * 添加健康数据接口
 * @param data 要添加的健康数据
 * @returns Promise
 */
export const addHealthData = (data: any): Promise<void> => {
  return request.post('/health/data', data)
}