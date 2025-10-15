/**
 * 系统用户管理模块 API（中文注释）
 */
import request from '../http'
import type { PageResponse } from '../types'
import type { UserItem } from '../types/userManageTypes'

/**
 * 获取用户分页列表
 * @param payload 已经过页面层组装的查询参数
 * 结构: { pageNum, pageSize, query: { username, realName, phone, role, status, ... } }
 */
export const getUserList = (payload: any): Promise<PageResponse<UserItem>> => {
  return request.post('/admin/users/page', payload) as Promise<PageResponse<UserItem>>
}

export const systemUserApi = {
  getUserList
}