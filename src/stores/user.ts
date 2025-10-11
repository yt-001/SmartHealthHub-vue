// 用户相关状态管理（仅存储与清理，不在 Store 内调用接口；中文注释）
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/typings'

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
    userInfo.value = null
  }

  return {
    // 状态
    userInfo,
    isLoggedIn,
    // 方法
    setUserInfo,
    updateUserInfo,
    clearUser
  }
})