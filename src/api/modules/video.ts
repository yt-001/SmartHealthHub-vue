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

/** 获取审核视频列表（分页） */
export function fetchVideoReviewList(params: VideoReviewPageQuery) {
  return request.post(VIDEO_REVIEW_LIST_PATH, params) as Promise<ApiResponse<VideoReviewPageResult>>
}