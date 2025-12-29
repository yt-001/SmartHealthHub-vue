// 药品管理相关类型定义（中文注释）
import type { BasePageQuery, PageResult } from './index'

/** 药品信息 VO（与后端 MedicinesVo 对齐） */
export interface MedicineVO {
  /** 主键ID（雪花ID，后端以字符串返回） */
  id: string
  /** 药品名称（展示名） */
  name: string
  /** 小类名称（子分类名称） */
  subCategoryName?: string | null
  /** 通用名称 */
  commonName?: string | null
  /** 品牌/商品名 */
  brandName?: string | null
  /** 简介摘要（用于卡片文案） */
  description?: string | null
  /** 封面图片URL */
  coverImageUrl?: string | null
  /** 图片列表JSON字符串 */
  images?: string | null
  /** 规格列表JSON字符串 */
  specs?: string | null
  /** 标签JSON字符串 */
  tags?: string | null
  /** 推荐级别文案（如“首选推荐”） */
  recommendationLevel?: string | null
  /** 是否处方药：0 否（OTC） 1 是 */
  isPrescription: number
  /** 现价 */
  price: number
  /** 原价 */
  originalPrice?: number | null
  /** 月售/销量 */
  sales?: number
  /** 好评率百分比（0-100） */
  rating?: number
  /** 适应症 */
  indications?: string | null
  /** 功能主治 */
  functions?: string | null
  /** 用法用量 */
  dosage?: string | null
  /** 不良反应 */
  adverseReactions?: string | null
  /** 禁忌 */
  contraindications?: string | null
  /** 注意事项 */
  precautions?: string | null
  /** 状态：0 隐藏 1 显示 */
  status: number
  /** 逻辑删除：0 正常 1 已删 */
  isDeleted: number
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/** 药品列表查询条件（对应分页接口的查询参数） */
export interface MedicineQuery {
  /** 药品名称（模糊查询） */
  name?: string
  /** 是否处方药：0 否 1 是 */
  isPrescription?: number
  /** 状态：0 隐藏 1 显示 */
  status?: number
  /** 价格范围-最小值 */
  minPrice?: number
  /** 价格范围-最大值 */
  maxPrice?: number
  /** 分类ID（通过关联表筛选） */
  categoryId?: number
  /** 大类ID（查询该大类下所有子分类关联的药品） */
  parentCategoryId?: number
}

/** 药品分页查询入参 */
export type MedicinePageQuery = BasePageQuery<MedicineQuery>

/** 药品分页结果 */
export type MedicinePageResult = PageResult<MedicineVO>

/** 新增药品 DTO（对应 MedicinesDto） */
export interface MedicineCreateDTO {
  name: string
  commonName?: string
  brandName?: string
  description?: string
  coverImageUrl?: string
  images?: string
  specs?: string
  tags?: string
  recommendationLevel?: string
  isPrescription?: number
  price: number
  originalPrice?: number
  sales?: number
  rating?: number
  indications?: string
  functions?: string
  dosage?: string
  adverseReactions?: string
  contraindications?: string
  precautions?: string
  status?: number
  isDeleted?: number
}

/** 更新药品 DTO（对应 MedicinesDto，包含主键ID） */
export interface MedicineUpdateDTO extends Partial<MedicineCreateDTO> {
  /** 药品ID */
  id: string | number
}

/** 药品分类 VO（与 MedicineCategoriesVo 对齐） */
export interface MedicineCategoryVO {
  id: number
  parentId?: number | null
  name: string
  description?: string | null
  sortOrder: number
  /** 是否启用：0 否 1 是 */
  isEnabled: number
  createdAt: string
  updatedAt: string
}

/** 药品分类查询条件 */
export interface MedicineCategoryQuery {
  /** 父分类ID（为空表示一级分类） */
  parentId?: number | null
  /** 分类名称 */
  name?: string
  /** 是否启用：0 否 1 是 */
  isEnabled?: number
}

/** 药品分类分页查询入参 */
export type MedicineCategoryPageQuery = BasePageQuery<MedicineCategoryQuery>

/** 药品分类分页结果 */
export type MedicineCategoryPageResult = PageResult<MedicineCategoryVO>

/** 新增药品分类 DTO */
export interface MedicineCategoryCreateDTO {
  parentId?: number | null
  name: string
  description?: string
  sortOrder?: number
  isEnabled?: number
}

/** 更新药品分类 DTO */
export interface MedicineCategoryUpdateDTO extends Partial<MedicineCategoryCreateDTO> {
  id: number
}

/** 药品分类关联 VO（与 MedicineCategoryRelationsVo 对齐） */
export interface MedicineCategoryRelationVO {
  id: number
  medicineId: number
  categoryId: number
  createdAt: string
  medicineName?: string
  categoryName?: string
}

/** 药品分类关联查询条件 */
export interface MedicineCategoryRelationQuery {
  medicineId?: number
  categoryId?: number
  /** 大类ID（父分类ID） */
  parentCategoryId?: number
}

/** 药品分类关联分页查询入参 */
export type MedicineCategoryRelationPageQuery = BasePageQuery<MedicineCategoryRelationQuery>

/** 药品分类关联分页结果 */
export type MedicineCategoryRelationPageResult = PageResult<MedicineCategoryRelationVO>

/** 新增药品分类关联 DTO */
export interface MedicineCategoryRelationCreateDTO {
  medicineId: number
  categoryId: number
}

/** 更新药品分类关联 DTO */
export interface MedicineCategoryRelationUpdateDTO extends Partial<MedicineCategoryRelationCreateDTO> {
  id: number
}

/** 前台调理推荐-药品结构 */
export interface MedicineRecommendationMedicine {
  id: number
  name: string
  image?: string | null
  desc?: string | null
  price?: number
  tags?: string[]
  recommendationLevel?: string | null
}

/** 前台调理推荐-小类结构 */
export interface MedicineRecommendationSubCategory {
  id: number
  name: string
  desc?: string | null
  color?: string | null
  medicines: MedicineRecommendationMedicine[]
}

/** 前台调理推荐-大类结构 */
export interface MedicineRecommendationCategory {
  id: number
  name: string
  icon?: string | null
  subCategories: MedicineRecommendationSubCategory[]
}
