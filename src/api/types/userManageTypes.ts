/**
 * 系统用户相关类型定义（中文注释）
 */
import type { BasePageQuery } from '../types'

export interface UserItem {
  /** 用户ID */
  id: number
  /** 登录账号 */
  username: string
  /** 头像地址 */
  avatarUrl: string
  /** 真实姓名 */
  realName: string
  /** 角色: 0管理员 1医生 2患者 */
  role: 0 | 1 | 2
  /** 手机号 */
  phone: string
  /** 邮箱 */
  email: string
  /** 出生日期 */
  birthDate: string
  /** 性别: M男 F女 O其他 */
  gender: 'M' | 'F' | 'O'
  /** 账号状态: 0正常 1锁定 2未激活 3已注销 */
  status: 0 | 1 | 2 | 3
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/** 列表筛选字段（仅业务字段，公共时间范围使用 BaseQuery 的 createdStart/createdEnd、updatedStart/updatedEnd） */
export interface UserListFilter {
  /** 登录账号 */
  username?: string
  /** 真实姓名 */
  realName?: string
  /** 手机号 */
  phone?: string
  /** 角色: 0管理员 1医生 2患者 */
  role?: 0 | 1 | 2
  /** 性别: M男 F女 O其他 */
  gender?: 'M' | 'F' | 'O'
  /** 账号状态: 0正常 1锁定 2未激活 3已注销 */
  status?: 0 | 1 | 2 | 3
}

/** 列表查询参数（分页+排序+业务条件） */
export type UserListParams = BasePageQuery<UserListFilter>