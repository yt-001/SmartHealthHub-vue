// 视频审核/健康视频相关类型定义（中文注释）
import type { BasePageQuery, PageResult } from './index'

/** 单个视频对象（与后端 HealthVideoVO 对齐，补充 id/createdAt/updatedAt） */
export interface HealthVideoVO {
  /** 主键ID */
  id: string
  /** 视频标题 */
  title: string
  /** 视频描述 */
  description: string
  /** 封面图片URL */
  coverImageUrl: string
  /** 视频文件URL */
  videoUrl: string
  /** 视频时长（秒） */
  duration: number
  /** 作者ID */
  authorId: string
  /** 作者姓名 */
  authorName: string
  /** 分类/标签 */
  // category: string // 已移除
  category: string // 暂时恢复
  /** 观看次数 */
  viewCount: number
  /** 点赞次数 */
  likeCount: number
  /** 评论数量 */
  commentCount: number
  /** 是否置顶：0 否 1 是 */
  isTop: 0 | 1
  /** 状态：0 草稿 1 已发布 2 已下架 3 审核中 4 未通过审核 */
  status: 0 | 1 | 2 | 3 | 4
  /** 创建时间（后端 BaseVO） */
  createdAt: string
  /** 更新时间（后端 BaseVO） */
  updatedAt: string
}

/** 视频列表查询条件（后端希望接收的 query 字段） */
export interface VideoReviewQuery {
  title?: string
  authorId?: number | string
  authorName?: string
  deptId?: number | string
  // category?: string // 已移除
  category?: string // 暂时恢复：数据库未变更，仍需使用此字段筛选
  isTop?: number
  status?: number
  /** 可选：状态列表，允许同时传 3/4 等多个状态 */
  statusList?: (0 | 1 | 2 | 3 | 4)[]
  createdStart?: string
  createdEnd?: string
}

/** 分页查询入参类型（POST 请求体） */
export type VideoReviewPageQuery = BasePageQuery<VideoReviewQuery>

/** 分页结果类型：视频列表 */
/** 列表显示对象类型：健康视频审核列表VO（仅列表必要字段） */
export interface HealthVideoReviewVO {
  /** 主键ID */
  id: string
  /** 视频标题 */
  title: string
  /** 作者姓名 */
  authorName: string
  /** 视频封面图片URL */
  coverImageUrl: string
  /** 视频时长（秒） */
  duration: number
  /** 分类列表（管理员接口返回） */
  categories?: { id: number; name: string }[]
  /** 状态：0 草稿 1 已发布 2 已下架 3 审核中 4 未通过审核 */
  status: 0 | 1 | 2 | 3 | 4
  /** 创建时间 */
  createdAt: string
}

export type VideoReviewPageResult = PageResult<HealthVideoReviewVO>

/** 健康视频创建DTO */
export interface HealthVideoCreateDTO {
  /** 视频标题 */
  title: string
  /** 视频描述 */
  description?: string
  /** 视频封面图片URL */
  coverImageUrl?: string
  /** 视频文件URL */
  videoUrl: string
  /** 视频时长（秒） */
  duration?: number
  /** 作者ID */
  authorId: number | string
  /** 视频分类/标签（JSON格式存储分类ID列表） */
  category?: string
  /** 是否置顶：0 否 1 是 */
  isTop?: number
  /** 状态：0 草稿 1 已发布 2 已下架 3 审核中 4 未通过审核 */
  status?: number
}

/** ---------------- 视频分类相关类型 ---------------- */

/** 视频分类查询对象 */
export interface VideoCategoriesQuery {
  /** 分类名称（模糊查询） */
  name?: string
  /** 是否启用：0 否 1 是 */
  isEnabled?: number
}

/** 视频分类列表VO */
export interface VideoCategoriesVO {
  id: number
  name: string
  description?: string
  sortOrder: number
  isEnabled: number
}

/** 简化版分类VO */
export interface CategorySimpleVO {
  id: number
  name: string
}

/** 视频分类创建DTO */
export interface VideoCategoriesCreateDTO {
  name: string
  description?: string
  sortOrder?: number
  isEnabled?: number
}

/** 视频分类更新DTO */
export interface VideoCategoriesUpdateDTO {
  id: number
  name?: string
  description?: string
  sortOrder?: number
  isEnabled?: number
}
