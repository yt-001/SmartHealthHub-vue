/**
 * 审核文章相关接口封装（中文注释）
 * - POST 请求，入参为分页 + 查询对象
 * - 路径占位，待你填充真实后端地址
 */
import request from '../http'
import type { ApiResponse } from '../types'
import type { ArticleReviewPageQuery, ArticleReviewPageResult, HealthArticleVO } from '../types/articleTypes'

/** 后端路径占位：请按后端真实接口修改为正确路径 */
const ARTICLE_REVIEW_LIST_PATH = '/health-articles/page'
const ARTICLE_REVIEW_DETAIL_BASE = '/health-articles'

/** 获取审核文章列表（分页） */
export function fetchArticleReviewList(params: ArticleReviewPageQuery) {
  return request.post(ARTICLE_REVIEW_LIST_PATH, params) as Promise<ApiResponse<ArticleReviewPageResult>>
}

/** 获取文章审核详情（GET /{id}/view） */
export function fetchArticleReviewDetail(id: string | number) {
  const path = `${ARTICLE_REVIEW_DETAIL_BASE}/${id}/view`
  return request.get(path) as Promise<ApiResponse<HealthArticleVO>>
}

/** 审核健康文章（PUT /{id}/review?status=...） */
export function approveArticleReview(id: string | number, status: 0 | 1 | 2 | 3 | 4) {
  const path = `${ARTICLE_REVIEW_DETAIL_BASE}/${id}/review`
  // 中文注释：后端使用 @RequestParam Byte status，因此通过 params 传参
  return request.put(path, {}, { params: { status } }) as Promise<ApiResponse<string>>
}
