// API 接口统一管理（中文注释）
import request from '@/utils/request'
import type { UserInfo, PageParams, PageResponse } from '@/typings'

export const userApi = {
  // 获取用户信息
  getUserInfo(): Promise<UserInfo> {
    return request.get('/user/info')
  },
  // 登录
  login(data: { username: string; password: string }): Promise<{ token: string }> {
    return request.post('/user/login', data)
  },
  // 注册
  register(data: { username: string; email: string; password: string }): Promise<void> {
    return request.post('/user/register', data)
  }
}

export const healthApi = {
  // 获取健康数据列表
  getHealthDataList(params: PageParams): Promise<PageResponse> {
    return request.get('/health/data', { params })
  },
  // 添加健康数据
  addHealthData(data: any): Promise<void> {
    return request.post('/health/data', data)
  }
}