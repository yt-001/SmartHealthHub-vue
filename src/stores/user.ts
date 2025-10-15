// 用户相关状态管理（仅存储与清理，不在 Store 内调用接口；中文注释）
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/typings'
import { check as apiCheck, refresh as apiRefresh } from '@/api/modules/user'

/**
 * 用户 Store：
 * - 只维护用户信息的内存状态
 * - 提供设置/更新/清空方法
 * - 不负责登录、刷新、拉取信息等接口调用（这些在组件或业务逻辑中直接调后端 API）
 */
export const useUserStore = defineStore('user', () => {
  // 用户信息（由组件在登录后自行调用接口获取并写入）
  const userInfo = ref<UserInfo | null>(null)

  // 是否已登录（仅根据是否有用户信息来判断）
  const isLoggedIn = computed(() => !!userInfo.value)

  /**
   * 设置用户信息（登录后或刷新用户资料时）
   */
  const setUserInfo = (info: UserInfo | null) => {
    userInfo.value = info
  }

  /**
   * 局部更新用户信息（编辑头像、昵称等场景）
   */
  const updateUserInfo = (patch: Partial<UserInfo>) => {
    if (!userInfo.value) return
    userInfo.value = { ...userInfo.value, ...patch }
  }

  /**
   * 清空本地用户信息（退出或认证失效）
   */
  const clearUser = () => {
    // 清空本地用户信息（退出或认证失效）
    userInfo.value = null
    // 重置启动期承诺，便于下次登录后重新初始化
    bootPromise = null
  }

  /**
   * 会话校验：调用 /auth/check，成功则写入用户信息
   * 用于页面刷新后保持状态不变
   */
  const check = async (): Promise<void> => {
    try {
      const res = await apiCheck()
      // 约定后端统一响应结构：{ code, msg, data }
      const data = (res as any)?.data ?? res
      setUserInfo(data as UserInfo)
      console.log('会话校验成功：', userInfo.value)
    } catch (e) {
      // 校验失败不做页面跳转，这里仅保持状态（也可按需清理）
      console.warn('会话校验失败：', e)
    }
  }

  /**
   * 刷新访问令牌（供 http.ts 响应拦截器使用）
   * 基于 HttpOnly Cookie，只需调用后端刷新接口
   */
  const refreshAccessToken = async (): Promise<void> => {
    await apiRefresh()
  }

  /**
   * 启动期会话初始化（只触发一次实际请求）：
   * - 首次调用时执行 check() 并缓存 Promise
   * - 后续调用仅复用同一个 Promise，不会二次请求
   */
  let bootPromise: Promise<void> | null = null
  const bootstrap = async (): Promise<void> => {
    if (!bootPromise) {
      bootPromise = check()
    }
    try {
      await bootPromise
    } finally {
      // 保留 bootPromise，防止并发期间多次触发；若需支持重新登录后重置可在 clearUser 时置 null
    }
  }

  return {
    // 状态
    userInfo,
    isLoggedIn,
    // 方法
    setUserInfo,
    updateUserInfo,
    clearUser,
    check,
    refreshAccessToken,
    // 启动期初始化（全局只等待这一份 Promise）
    bootstrap
  }
})