/**
 * 审核视频相关接口封装（中文注释）
 * - POST 请求，入参为分页 + 查询对象
 * - 路径占位，待你填充真实后端地址
 */
import request from '../http'
import type { ApiResponse } from '../types'
import type { VideoReviewPageQuery, VideoReviewPageResult } from '../types/videoTypes'

/**
 * 后端路径占位：请按后端真实接口修改为正确路径
 * 例如：'/admin/video/review/list'
 */
const VIDEO_REVIEW_LIST_PATH = '/health-videos/page'
const VIDEO_REVIEW_DETAIL_BASE = '/health-videos'

/** 获取审核视频列表（分页） */
export function fetchVideoReviewList(params: VideoReviewPageQuery) {
  return request.post(VIDEO_REVIEW_LIST_PATH, params) as Promise<ApiResponse<VideoReviewPageResult>>
}

/** 获取视频审核详情（GET /{id}/view） */
export function fetchVideoReviewDetail(id: string | number) {
  const path = `${VIDEO_REVIEW_DETAIL_BASE}/${id}/view`
  return request.get(path) as Promise<ApiResponse<import('../types/videoTypes').HealthVideoVO>>
}

/** 审核健康视频（PUT /{id}/review?status=...） */
export function approveVideoReview(id: string | number, status: 0 | 1 | 2 | 3 | 4) {
  const path = `${VIDEO_REVIEW_DETAIL_BASE}/${id}/review`
  // 中文注释：后端使用 @RequestParam Byte status，因此通过 params 传参
  return request.put(path, {}, { params: { status } }) as Promise<ApiResponse<string>>
}