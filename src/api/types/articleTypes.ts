// 文章审核/健康文章相关类型定义（中文注释）
import type { BasePageQuery, PageResult } from './index'

/** 单个文章对象（与后端 HealthArticleVO 对齐） */
export interface HealthArticleVO {
  /** 主键ID */
  id: number | string
  /** 文章标题 */
  title: string
  /** 文章摘要（后端字段：summary） */
  summary: string
  /** 正文内容（可选，可能是富文本HTML或纯文本） */
  content?: string
  /** 文章封面图片URL */
  coverImageUrl: string
  /** 作者ID */
  authorId: number
  /** 作者姓名 */
  authorName: string
  /** 科室ID */
  deptId: number
  /** 科室名称 */
  deptName: string
  /** 文章分类/标签 */
  category: string
  /** 浏览次数 */
  viewCount: number
  /** 点赞次数 */
  likeCount: number
  /** 是否置顶：0 否 1 是 */
  isTop: 0 | 1
  /** 状态：0 草稿 1 已发布 2 已下架 3 审核中 4 未通过审核 */
  status: 0 | 1 | 2 | 3 | 4
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/** 文章列表查询条件（后端期望接收的 query 字段） */
export interface ArticleReviewQuery {
  title?: string
  authorName?: string
  deptId?: number | null
  category?: string
  isTop?: 0 | 1 | null
  /** 固定状态条件：可选传单个 status 或传递 statusList */
  status?: 0 | 1 | 2 | 3 | 4 | null
  /** 可选：状态列表，允许同时传 3/4 等多个状态 */
  statusList?: (0 | 1 | 2 | 3 | 4)[]
  createdStart?: string
  createdEnd?: string
}

/** 分页查询入参类型（POST 请求体） */
export type ArticleReviewPageQuery = BasePageQuery<ArticleReviewQuery>

/** 列表显示对象类型：健康文章审核列表VO（仅列表必要字段） */
export interface HealthArticleReviewVO {
  /** 主键ID */
  id: number
  /** 文章标题 */
  title: string
  /** 作者姓名 */
  authorName: string
  /** 科室名称 */
  deptName: string
  /** 文章分类/标签 */
  category: string
  /** 浏览次数 */
  viewCount: number
  /** 状态：0 草稿 1 已发布 2 已下架 3 审核中 4 未通过审核 */
  status: 0 | 1 | 2 | 3 | 4
  /** 创建时间 */
  createdAt: string
}

/** 分页结果类型：文章列表 */
export type ArticleReviewPageResult = PageResult<HealthArticleReviewVO>
