import request from '../http'
import type { UserInfo } from '@/typings'

/**
 * 登录接口
 * @param data 登录凭据，包含用户名和密码
 * @returns Promise，解析后为包含 token 的对象
 */
export const login = (data: { username: string; password: string }): Promise<{ token: string }> => {
  return request.post('/user/login', data)
}

/**
 * 注册接口
 * @param data 注册信息，包含用户名、邮箱和密码
 * @returns Promise
 */
export const register = (data: { username: string; email: string; password: string }): Promise<void> => {
  return request.post('/user/register', data)
}

/**
 * 获取用户信息接口
 * @returns Promise，解析后为用户信息对象
 */
export const getUserInfo = (): Promise<UserInfo> => {
  return request.get('/user/info')
}