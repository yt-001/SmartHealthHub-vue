// 用户模块 API（HttpOnly Cookie 会话，中文注释）
import request from '../http'
import type { UserInfo } from '@/typings'
import type { LoginPayload } from '@/api/types/userTypes'
import { ApiResponse } from '@/api/types'

/**
 * 登录接口（JSON 提交，配合后端 @RequestParam/@RequestBody 的 JSON 接收）
 * 提交参数（JSON）：{ phone: string, password: string, role?: number }
 * 返回：统一响应（经 http 响应拦截器解包后的 data）
 */
export const login = async (data: LoginPayload): Promise<ApiResponse<any>> => {
  // 直接以 JSON 提交；http.ts 已全局设置 Content-Type: application/json;charset=UTF-8，且 withCredentials: true
  return request.post('/auth/login', data) as Promise<ApiResponse<any>>
}

/**
 * 刷新会话/令牌（HttpOnly Cookie），前端不持久化令牌
 * 约定路径：/auth/refresh（如后端不同，请告知我具体路径以便调整）
 * 返回：void
 */
export const refresh = async (): Promise<ApiResponse<void>> => {
  return request.post('/auth/refresh', {}) as Promise<ApiResponse<void>>
}

/**
 * 校验当前会话有效性（页面刷新后调用）
 * 场景：使用 HttpOnly Cookie 管理会话，前端在 App 初始化或路由前置时调用该接口
 * 约定路径：/auth/check（后端验证 Cookie 中的访问令牌有效性）
 * 返回：用户信息（或有效状态），以便页面维持当前状态不跳转
 */
export const check = async (): Promise<ApiResponse<UserInfo>> => {
  // GET /auth/check：后端若有效返回 200 + 用户信息；无效时返回 401（由 http.ts 拦截器处理）
  return request.get('/auth/check') as Promise<ApiResponse<UserInfo>>
}

/**
 * 退出登录（销毁后端会话 + 清理 HttpOnly Cookie）
 * 返回：void
 */
export const logout = async (): Promise<ApiResponse<void>> => {
  // 使用 POST 语义化登出；若后端是 GET，请告知我调整
  return request.post('/auth/logout', {}) as Promise<ApiResponse<void>>
}

/**
 * 更新用户信息（仅提交有变化的字段；页面侧已做 diff）
 * 协议：POST /user/updateProfile
 * 入参：{ id: number, ...变化字段 }
 * 返回：void 或更新后的用户信息（视后端而定）
 * 注意：后端路径未确定时可先占位，后续再调整
 */
export const updateProfile = async (data: Record<string, any>): Promise<ApiResponse<void>> => {
  // 这里默认使用 JSON 提交；http.ts 已处理 baseURL 与拦截器
  return request.put('/user/updateProfile', data) as Promise<ApiResponse<void>>
}

/**
 * 注册接口
 */
export const register = async (data: any): Promise<ApiResponse<any>> => {
  return request.post('/auth/register', data) as Promise<ApiResponse<any>>
}

/**
 * 医生认证申请（普通用户也可发起，后端会自动切换角色并进入待审核状态）
 * @param data 认证信息
 */
export const submitDoctorAuthentication = async (data: any): Promise<ApiResponse<any>> => {
  return request.post('/auth/doctor-authenticate', data) as Promise<ApiResponse<any>>
}
