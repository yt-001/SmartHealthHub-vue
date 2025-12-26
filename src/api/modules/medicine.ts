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
  MedicineCategoryRelationUpdateDTO
} from '@/api/types/medicineTypes'

/**
 * 将 BasePageQuery<T> 转换为后端 PageParam 兼容的请求体结构
 * - 与后端 PageParam<T> 字段保持一致：pageNum/pageSize/sortField/sortDirection/query
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
  return request.get(`/medicine-categories/sub-list/${parentId}`) as Promise<ApiResponse<MedicineCategoryVO[]>>
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

