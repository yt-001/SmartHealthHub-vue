// 用户相关状态管理（中文注释）
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfo } from '@/typings'
import { userApi } from '@/api'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>(localStorage.getItem('token') || '')

  const setToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }
  const clearToken = () => {
    token.value = ''
    localStorage.removeItem('token')
    userInfo.value = null
  }

  const getUserInfo = async () => {
    const data = await userApi.getUserInfo()
    userInfo.value = data
    return data
  }

  const login = async (payload: { username: string; password: string }) => {
    const { token: newToken } = await userApi.login(payload)
    setToken(newToken)
    await getUserInfo()
    return true
  }

  const logout = () => { clearToken() }

  return { userInfo, token, setToken, clearToken, getUserInfo, login, logout }
})