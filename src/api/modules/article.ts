/**
 * 审核文章相关接口封装（中文注释）
 * - POST 请求，入参为分页 + 查询对象
 * - 路径占位，待你填充真实后端地址
 */
import request from '../http'
import type { ApiResponse } from '../types'
import type { 
  ArticleReviewPageQuery, 
  ArticleReviewPageResult, 
  HealthArticleVO, 
  HealthArticleCreateDTO,
  ArticleCategoriesQuery,
  ArticleCategoriesVO,
  CategorySimpleVO,
  ArticleCategoriesCreateDTO,
  ArticleCategoriesUpdateDTO
} from '../types/articleTypes'
import type { PageResult, BasePageQuery } from '../types/index'

/** 后端路径：管理员分页列表 */
const ARTICLE_REVIEW_LIST_PATH = '/health-articles/admin/page'
const ARTICLE_REVIEW_DETAIL_BASE = '/health-articles'

/** ---------------- 文章分类管理接口 ---------------- */

/** 分页查询文章分类 */
export function fetchArticleCategoriesPage(params: BasePageQuery<ArticleCategoriesQuery>) {
  return request.post('/article-categories/page', params) as Promise<ApiResponse<PageResult<ArticleCategoriesVO>>>
}

/** 获取所有启用的文章分类（简化信息） */
export function fetchArticleCategoriesSimpleList() {
  return request.get('/article-categories/simple-list') as Promise<ApiResponse<CategorySimpleVO[]>>
}

/** 获取所有启用的文章分类 */
export function fetchArticleCategoriesEnabledList() {
  return request.get('/article-categories/enabled-list') as Promise<ApiResponse<ArticleCategoriesVO[]>>
}

/** 根据ID获取文章分类详情 */
export function fetchArticleCategoryDetail(id: number | string) {
  return request.get(`/article-categories/${id}`) as Promise<ApiResponse<ArticleCategoriesVO>>
}

/** 创建文章分类 */
export function createArticleCategory(data: ArticleCategoriesCreateDTO) {
  return request.post('/article-categories/create', data) as Promise<ApiResponse<string>>
}

/** 更新文章分类 */
export function updateArticleCategory(data: ArticleCategoriesUpdateDTO) {
  return request.put('/article-categories/update', data) as Promise<ApiResponse<string>>
}

/** 删除文章分类 */
export function deleteArticleCategory(id: number | string) {
  return request.delete(`/article-categories/delete/${id}`) as Promise<ApiResponse<string>>
}

/** 获取文章关联的分类ID列表 */
export function fetchArticleRelatedCategories(articleId: number | string) {
  return request.get(`/health-articles/article-category-relations/article/${articleId}`) as Promise<ApiResponse<CategorySimpleVO[]>>
}


/**
 * 根据作者ID分页查询健康文章
 * - 后端接口：POST /health-articles/author/{authorId}/page
 * - 入参：{ pageNum, pageSize, sortField?, sortDirection? }
 * - 出参：{ total, list, pageNum, pageSize, pages }
 */
export function fetchPublicArticlesByAuthorId(authorId: number | string, params: {
  pageNum: number
  pageSize: number
  sortField?: string
  sortDirection?: 'ASC' | 'DESC'
}) {
  return request.post(`/health-articles/author/${authorId}/page`, params) as Promise<
    ApiResponse<{
      total: number
      list: HealthArticleVO[]
      pageNum: number
      pageSize: number
      pages: number
    }>
  >
}

/** ---------------- 文章管理接口 ---------------- */

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

/**
 * 用户端：公开健康文章分页列表
 * - 后端接口：POST /health-articles/public/page
 * - 入参：{ pageNum, pageSize, sortField, sortDirection, query }
 * - 出参：{ total, list, pageNum, pageSize, pages }
 */
export function fetchPublicArticlesPage(params: {
  pageNum: number
  pageSize: number
  sortField?: string
  sortDirection?: 'ASC' | 'DESC'
  query?: Record<string, any>
}) {
  return request.post('/health-articles/public/page', params) as Promise<
    ApiResponse<{
      total: number
      list: HealthArticleVO[]
      pageNum: number
      pageSize: number
      pages: number
    }>
  >
}

/**
 * 创建健康文章
 * - 后端接口：POST /health-articles/create
 */
export function createArticle(data: HealthArticleCreateDTO) {
  return request.post('/health-articles/create', data) as Promise<ApiResponse<string>>
}

/**
 * 更新健康文章
 * - 后端接口：PUT /health-articles/update
 */
export function updateArticle(data: any) {
  return request.put('/health-articles/update', data) as Promise<ApiResponse<string>>
}
/**
 * 说明：管理员端不使用单独的更新接口，直接复用通用更新接口
 */
