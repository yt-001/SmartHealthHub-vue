/**
 * 路由配置（中文注释）
 * - 使用懒加载按需加载页面组件
 * - 配置基础路由：/ 对应 Home，/news 对应 News
 */
import { createRouter, createWebHistory, RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

const routes: RouteRecordRaw[] = [
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 可选：全局前置守卫，设置页面标题
router.beforeEach((to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  if (to.meta?.title) {
    document.title = String(to.meta.title)
  }
  next()
})

export default router