/**
 * 药品管理相关接口封装（中文注释）
 * - 药品信息 / 药品分类 / 药品分类关联
 * - 统一使用 ApiResponse<T> 作为返回结构
 * - 分页查询接口根据 BasePageQuery<T> 展开为 POST JSON 请求体
 */
import request from '../http'
import type { ApiResponse, BasePageQuery, PageResult } from '@/api/types'
import type {
  MedicineVO,
  MedicineQuery,
  MedicinePageResult,
  MedicineCreateDTO,
  MedicineUpdateDTO,
  MedicineCategoryVO,
  MedicineCategoryQuery,
  MedicineCategoryPageResult,
  MedicineCategoryCreateDTO,
  MedicineCategoryUpdateDTO,
  MedicineCategoryRelationVO,
  MedicineCategoryRelationQuery,
  MedicineCategoryRelationPageResult,
  MedicineCategoryRelationCreateDTO,
  MedicineCategoryRelationUpdateDTO,
  MedicineTagVO,
  MedicineTagQuery,
  MedicineTagPageResult,
  MedicineTagCreateDTO,
  MedicineTagUpdateDTO,
  MedicineRecommendationLevelVO,
  MedicineRecommendationLevelQuery,
  MedicineRecommendationLevelPageResult,
  MedicineRecommendationLevelCreateDTO,
  MedicineRecommendationLevelUpdateDTO,
  MedicineRecommendationCategoryVO
} from '@/api/types/medicineTypes'

/**
 * 将 BasePageQuery<T> 展开为后端 PageParam 兼容的请求体
 * @param params 分页查询入参（包含 pageNum/pageSize/sort/query）
 */
const buildPostPageBody = <T>(params: BasePageQuery<T>): Record<string, any> => {
  const { pageNum, pageSize, sortField, sortDirection, query } = params
  return {
    pageNum,
    pageSize,
    ...(sortField ? { sortField } : {}),
    ...(sortDirection ? { sortDirection } : {}),
    ...(query ? { query } : {})
  }
}

/** 分页查询药品信息（POST /medicines/page） */
export const fetchMedicinesPage = (
  params: BasePageQuery<MedicineQuery>
): Promise<ApiResponse<PageResult<MedicineVO> | MedicinePageResult>> => {
  const body = buildPostPageBody<MedicineQuery>(params)
  return request.post('/medicines/page', body) as Promise<
    ApiResponse<PageResult<MedicineVO> | MedicinePageResult>
  >
}

/** 根据ID查询单个药品信息（GET /medicines/{id}） */
export const fetchMedicineDetail = (id: string | number): Promise<ApiResponse<MedicineVO>> => {
  return request.get(`/medicines/${id}`) as Promise<ApiResponse<MedicineVO>>
}

/** 新增药品信息（POST /medicines/create） */
export const createMedicine = (payload: MedicineCreateDTO): Promise<ApiResponse<number>> => {
  return request.post('/medicines/create', payload) as Promise<ApiResponse<number>>
}

/** 更新药品信息（PUT /medicines/update） */
export const updateMedicine = (payload: MedicineUpdateDTO): Promise<ApiResponse<boolean>> => {
  return request.put('/medicines/update', payload) as Promise<ApiResponse<boolean>>
}

/** 删除药品信息（DELETE /medicines/delete/{id}） */
export const deleteMedicine = (id: string | number): Promise<ApiResponse<boolean>> => {
  return request.delete(`/medicines/delete/${id}`) as Promise<ApiResponse<boolean>>
}

/** 分页查询药品分类（POST /medicine-categories/page） */
export const fetchMedicineCategoriesPage = (
  params: BasePageQuery<MedicineCategoryQuery>
): Promise<ApiResponse<PageResult<MedicineCategoryVO> | MedicineCategoryPageResult>> => {
  const body = buildPostPageBody<MedicineCategoryQuery>(params)
  return request.post('/medicine-categories/page', body) as Promise<
    ApiResponse<PageResult<MedicineCategoryVO> | MedicineCategoryPageResult>
  >
}

/** 获取药品大类列表（GET /medicine-categories/big-list） */
export const fetchMedicineBigCategories = (): Promise<ApiResponse<MedicineCategoryVO[]>> => {
  return request.get('/medicine-categories/big-list') as Promise<ApiResponse<MedicineCategoryVO[]>>
}

/** 根据大类ID获取小类列表（GET /medicine-categories/sub-list/{parentId}） */
export const fetchMedicineSubCategories = (
  parentId: number | string
): Promise<ApiResponse<MedicineCategoryVO[]>> => {
  return request.get(`/medicine-categories/sub-list/${parentId}`) as Promise<
    ApiResponse<MedicineCategoryVO[]>
  >
}

/** 根据ID查询药品分类详情（GET /medicine-categories/{id}） */
export const fetchMedicineCategoryDetail = (id: number | string): Promise<ApiResponse<MedicineCategoryVO>> => {
  return request.get(`/medicine-categories/${id}`) as Promise<ApiResponse<MedicineCategoryVO>>
}

/** 新增药品分类（POST /medicine-categories/create） */
export const createMedicineCategory = (
  payload: MedicineCategoryCreateDTO
): Promise<ApiResponse<number>> => {
  return request.post('/medicine-categories/create', payload) as Promise<ApiResponse<number>>
}

/** 更新药品分类（PUT /medicine-categories/update） */
export const updateMedicineCategory = (
  payload: MedicineCategoryUpdateDTO
): Promise<ApiResponse<boolean>> => {
  return request.put('/medicine-categories/update', payload) as Promise<ApiResponse<boolean>>
}

/** 删除药品分类（DELETE /medicine-categories/delete/{id}） */
export const deleteMedicineCategory = (id: number | string): Promise<ApiResponse<boolean>> => {
  return request.delete(`/medicine-categories/delete/${id}`) as Promise<ApiResponse<boolean>>
}

/** 分页查询药品与分类的关联信息（POST /medicine-category-relations/page） */
export const fetchMedicineCategoryRelationsPage = (
  params: BasePageQuery<MedicineCategoryRelationQuery>
): Promise<ApiResponse<PageResult<MedicineCategoryRelationVO> | MedicineCategoryRelationPageResult>> => {
  const body = buildPostPageBody<MedicineCategoryRelationQuery>(params)
  return request.post('/medicine-category-relations/page', body) as Promise<
    ApiResponse<PageResult<MedicineCategoryRelationVO> | MedicineCategoryRelationPageResult>
  >
}

/** 根据ID查询药品与分类的关联详情（GET /medicine-category-relations/{id}） */
export const fetchMedicineCategoryRelationDetail = (
  id: number | string
): Promise<ApiResponse<MedicineCategoryRelationVO>> => {
  return request.get(`/medicine-category-relations/${id}`) as Promise<ApiResponse<MedicineCategoryRelationVO>>
}

/** 新增药品与分类的关联信息（POST /medicine-category-relations） */
export const createMedicineCategoryRelation = (
  payload: MedicineCategoryRelationCreateDTO
): Promise<ApiResponse<number>> => {
  return request.post('/medicine-category-relations', payload) as Promise<ApiResponse<number>>
}

/** 更新药品与分类的关联信息（PUT /medicine-category-relations） */
export const updateMedicineCategoryRelation = (
  payload: MedicineCategoryRelationUpdateDTO
): Promise<ApiResponse<boolean>> => {
  return request.put('/medicine-category-relations', payload) as Promise<ApiResponse<boolean>>
}

/** 删除药品与分类的关联信息（DELETE /medicine-category-relations/{id}） */
export const deleteMedicineCategoryRelation = (id: number | string): Promise<ApiResponse<boolean>> => {
  return request.delete(`/medicine-category-relations/${id}`) as Promise<ApiResponse<boolean>>
}

/** 分页查询药品标签（POST /medicine-tags/page） */
export const fetchMedicineTagsPage = (
  params: BasePageQuery<MedicineTagQuery>
): Promise<ApiResponse<PageResult<MedicineTagVO> | MedicineTagPageResult>> => {
  const body = buildPostPageBody<MedicineTagQuery>(params)
  return request.post('/medicine-tags/page', body) as Promise<
    ApiResponse<PageResult<MedicineTagVO> | MedicineTagPageResult>
  >
}

/** 根据ID查询药品标签详情（GET /medicine-tags/{id}） */
export const fetchMedicineTagDetail = (
  id: number | string
): Promise<ApiResponse<MedicineTagVO>> => {
  return request.get(`/medicine-tags/${id}`) as Promise<ApiResponse<MedicineTagVO>>
}

/** 新增药品标签（POST /medicine-tags/create） */
export const createMedicineTag = (
  payload: MedicineTagCreateDTO
): Promise<ApiResponse<number>> => {
  return request.post('/medicine-tags/create', payload) as Promise<ApiResponse<number>>
}

/** 更新药品标签（PUT /medicine-tags/update） */
export const updateMedicineTag = (
  payload: MedicineTagUpdateDTO
): Promise<ApiResponse<boolean>> => {
  return request.put('/medicine-tags/update', payload) as Promise<ApiResponse<boolean>>
}

/** 删除药品标签（DELETE /medicine-tags/delete/{id}） */
export const deleteMedicineTag = (id: number | string): Promise<ApiResponse<boolean>> => {
  return request.delete(`/medicine-tags/delete/${id}`) as Promise<ApiResponse<boolean>>
}

/** 分页查询药品推荐级别（POST /medicine-recommendation-levels/page） */
export const fetchMedicineRecommendationLevelsPage = (
  params: BasePageQuery<MedicineRecommendationLevelQuery>
): Promise<
  ApiResponse<
    PageResult<MedicineRecommendationLevelVO> | MedicineRecommendationLevelPageResult
  >
> => {
  const body = buildPostPageBody<MedicineRecommendationLevelQuery>(params)
  return request.post('/medicine-recommendation-levels/page', body) as Promise<
    ApiResponse<
      PageResult<MedicineRecommendationLevelVO> | MedicineRecommendationLevelPageResult
    >
  >
}

/** 根据ID查询药品推荐级别详情（GET /medicine-recommendation-levels/{id}） */
export const fetchMedicineRecommendationLevelDetail = (
  id: number | string
): Promise<ApiResponse<MedicineRecommendationLevelVO>> => {
  return request.get(
    `/medicine-recommendation-levels/${id}`
  ) as Promise<ApiResponse<MedicineRecommendationLevelVO>>
}

/** 新增药品推荐级别（POST /medicine-recommendation-levels/create） */
export const createMedicineRecommendationLevel = (
  payload: MedicineRecommendationLevelCreateDTO
): Promise<ApiResponse<number>> => {
  return request.post(
    '/medicine-recommendation-levels/create',
    payload
  ) as Promise<ApiResponse<number>>
}

/** 更新药品推荐级别（PUT /medicine-recommendation-levels/update） */
export const updateMedicineRecommendationLevel = (
  payload: MedicineRecommendationLevelUpdateDTO
): Promise<ApiResponse<boolean>> => {
  return request.put(
    '/medicine-recommendation-levels/update',
    payload
  ) as Promise<ApiResponse<boolean>>
}

/** 删除药品推荐级别（DELETE /medicine-recommendation-levels/delete/{id}） */
export const deleteMedicineRecommendationLevel = (
  id: number | string
): Promise<ApiResponse<boolean>> => {
  return request.delete(
    `/medicine-recommendation-levels/delete/${id}`
  ) as Promise<ApiResponse<boolean>>
}

/** 获取前台调理推荐分类树（GET /medicines/recommendation-tree） */
export const fetchRecommendationTree = (
  keyword?: string
): Promise<ApiResponse<MedicineRecommendationCategoryVO[]>> => {
  const params = keyword ? { keyword } : undefined
  return request.get('/medicines/recommendation-tree', { params }) as Promise<
    ApiResponse<MedicineRecommendationCategoryVO[]>
  >
}

