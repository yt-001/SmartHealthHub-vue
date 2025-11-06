// 首页图片（轮播图）类型定义，与后端 VO/Query 对齐
import type { BasePageQuery, PageResult } from './index'

/** 单个轮播图对象（与后端 CarouselItemsVO 对齐） */
export interface CarouselItemsVO {
  id?: string
  title: string
  description: string
  imageUrl: string
  targetType: number // 0 无跳转 1 健康文章 2 健康视频 3 外部链接
  targetId?: string
  targetUrl?: string
  sortOrder: number
  status: number // 0 隐藏 1 显示
}

/** 查询体：与后端 CarouselItemsQuery 对齐 */
export interface CarouselItemsQuery {
  targetType?: number
  status?: number
}

/** 分页查询入参：通用分页 + 查询体 */
export type CarouselItemsPageQuery = BasePageQuery<CarouselItemsQuery>

/** 分页返回体：列表与分页信息 */
export type CarouselItemsPageResult = PageResult<CarouselItemsVO>

/** 创建入参 DTO（与后端 CarouselItemsCreateDTO 对齐） */
export interface CarouselItemsCreateDTO {
  /** 轮播图标题 */
  title: string
  /** 轮播图描述 */
  description?: string
  /** 图片URL */
  imageUrl: string
  /** 跳转类型：0 无跳转 1 健康文章 2 健康视频 3 外部链接 */
  targetType: number
  /** 跳转目标ID（文章ID/视频ID） */
  targetId?: string
  /** 跳转目标URL（外部链接） */
  targetUrl?: string
  /** 排序字段，值越小越靠前 */
  sortOrder?: number
  /** 状态：0 隐藏 1 显示 */
  status: number
}
