// 轮播图管理接口
import request from '../http'
import { ApiResponse } from '@/api/types'
import type { CarouselItemsVO, CarouselItemsQuery, CarouselItemsPageResult, CarouselItemsCreateDTO } from '@/api/types/carouselItemsTypes'

export async function pageCarouselItems(body: { pageNum: number; pageSize: number } & CarouselItemsQuery): Promise<ApiResponse<CarouselItemsPageResult>> {
  return (await request.post('/carousel-items/page', body)) as unknown as ApiResponse<CarouselItemsPageResult>
}
export async function createCarouselItem(data: CarouselItemsCreateDTO): Promise<ApiResponse<void>> {
  return (await request.post('/carousel-items/create', data)) as unknown as ApiResponse<void>
}
export async function updateCarouselItem(data: CarouselItemsVO): Promise<ApiResponse<void>> {
  return (await request.put('/carousel-items/update', data)) as unknown as ApiResponse<void>
}
export async function deleteCarouselItem(id: string): Promise<ApiResponse<void>> {
  return (await request.delete(`/carousel-items/delete/${id}`)) as unknown as ApiResponse<void>
}
export async function displayCarouselItems(): Promise<CarouselItemsVO[]> {
  return (await request.get('/carousel-items/display')) as unknown as CarouselItemsVO[]
}
export async function getCarouselItemById(id: string): Promise<CarouselItemsVO> {
  return (await request.get(`/carousel-items/${id}`)) as unknown as CarouselItemsVO
}
