/**
 * 审核视频相关接口封装（中文注释）
 * - POST 请求，入参为分页 + 查询对象
 * - 路径占位，待你填充真实后端地址
 */
import request from '../http'
import type { ApiResponse } from '../types'
import type { 
  VideoReviewPageQuery, 
  VideoReviewPageResult, 
  HealthVideoVO, 
  HealthVideoCreateDTO,
  VideoCategoriesQuery,
  VideoCategoriesVO,
  CategorySimpleVO,
  VideoCategoriesCreateDTO,
  VideoCategoriesUpdateDTO
} from '../types/videoTypes'
import type { PageResult, BasePageQuery } from '../types/index'

/** 后端路径：管理员分页列表 */
const VIDEO_REVIEW_LIST_PATH = '/health-videos/admin/page'
const VIDEO_REVIEW_DETAIL_BASE = '/health-videos'

/** ---------------- 视频分类管理接口 ---------------- */

/** 分页查询视频分类 */
export function fetchVideoCategoriesPage(params: BasePageQuery<VideoCategoriesQuery>) {
  return request.post('/video-categories/page', params) as Promise<ApiResponse<PageResult<VideoCategoriesVO>>>
}

/** 获取所有启用的视频分类（简化信息） */
export function fetchVideoCategoriesSimpleList() {
  return request.get('/video-categories/simple-list') as Promise<ApiResponse<CategorySimpleVO[]>>
}

/** 获取所有启用的视频分类 */
export function fetchVideoCategoriesEnabledList() {
  return request.get('/video-categories/enabled-list') as Promise<ApiResponse<VideoCategoriesVO[]>>
}

/** 根据ID获取视频分类详情 */
export function fetchVideoCategoryDetail(id: number | string) {
  return request.get(`/video-categories/${id}`) as Promise<ApiResponse<VideoCategoriesVO>>
}

/** 创建视频分类 */
export function createVideoCategory(data: VideoCategoriesCreateDTO) {
  return request.post('/video-categories/create', data) as Promise<ApiResponse<string>>
}

/** 更新视频分类 */
export function updateVideoCategory(data: VideoCategoriesUpdateDTO) {
  return request.put('/video-categories/update', data) as Promise<ApiResponse<string>>
}

/** 删除视频分类 */
export function deleteVideoCategory(id: number | string) {
  return request.delete(`/video-categories/delete/${id}`) as Promise<ApiResponse<string>>
}

/** 获取视频关联的分类ID列表 */
export function fetchVideoRelatedCategories(videoId: number | string) {
  return request.get(`/health-videos/video-category-relations/video/${videoId}`) as Promise<ApiResponse<CategorySimpleVO[]>>
}


/**
 * 根据作者ID分页查询健康视频
 * - 后端接口：POST /health-videos/author/{authorId}/page
 * - 入参：{ pageNum, pageSize, sortField?, sortDirection? }
 * - 出参：{ total, list, pageNum, pageSize, pages }
 */
export function fetchPublicVideosByAuthorId(authorId: number | string, params: {
  pageNum: number
  pageSize: number
  sortField?: string
  sortDirection?: 'ASC' | 'DESC'
}) {
  return request.post(`/health-videos/author/${authorId}/page`, params) as Promise<
    ApiResponse<{
      total: number
      list: HealthVideoVO[]
      pageNum: number
      pageSize: number
      pages: number
    }>
  >
}

/** ---------------- 视频管理接口 ---------------- */

/** 获取审核视频列表（分页） */
export function fetchVideoReviewList(params: VideoReviewPageQuery) {
  return request.post(VIDEO_REVIEW_LIST_PATH, params) as Promise<ApiResponse<VideoReviewPageResult>>
}

/** 获取视频审核详情（GET /{id}/view） */
export function fetchVideoReviewDetail(id: string | number) {
  const path = `${VIDEO_REVIEW_DETAIL_BASE}/${id}/view`
  return request.get(path) as Promise<ApiResponse<HealthVideoVO>>
}

/** 审核健康视频（PUT /{id}/review?status=...） */
export function approveVideoReview(id: string | number, status: 0 | 1 | 2 | 3 | 4) {
  const path = `${VIDEO_REVIEW_DETAIL_BASE}/${id}/review`
  // 中文注释：后端使用 @RequestParam Byte status，因此通过 params 传参
  return request.put(path, {}, { params: { status } }) as Promise<ApiResponse<string>>
}

/**
 * 创建健康视频
 * - 后端接口：POST /health-videos/create
 */
export function createVideo(data: HealthVideoCreateDTO) {
  return request.post('/health-videos/create', data) as Promise<ApiResponse<string>>
}

/**
 * 更新健康视频
 * - 后端接口：PUT /health-videos/update
 */
export function updateVideo(data: any) {
  return request.put('/health-videos/update', data) as Promise<ApiResponse<string>>
}
/**
 * 说明：管理员端不使用单独的更新接口，直接复用通用更新接口
 */
