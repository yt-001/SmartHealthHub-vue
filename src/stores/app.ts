// 应用通用状态（中文注释）
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const sidebarCollapsed = ref(false)
  const isDark = ref(false)
  const loading = ref(false)

  const toggleSidebar = () => { sidebarCollapsed.value = !sidebarCollapsed.value }
  const toggleTheme = () => { isDark.value = !isDark.value }
  const setLoading = (status: boolean) => { loading.value = status }

  return { sidebarCollapsed, isDark, loading, toggleSidebar, toggleTheme, setLoading }
})