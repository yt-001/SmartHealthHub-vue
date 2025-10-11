import { createRouter, createWebHistory, RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import Login from '@/views/Login.vue'
import ClientHome from '@/views/ClientSide/ClientHome.vue'
import AdminHome from '@/views/RoleDashboard/AdminSide/AdminHome.vue'
import DoctorHome from '@/views/RoleDashboard/DoctorSide/DoctorHome.vue'
import RoleDashboard from '@/views/RoleDashboard/RoleDashboard.vue'


const routes: RouteRecordRaw[] = [
  // 根路径重定向到登录页
  { path: '/', redirect: '/login' },

  // 登录页
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { title: '登录' }
  },

  // 用户独立路由（用户角色专属）
  {
    path: '/client',
    name: 'ClientHome',
    component: ClientHome, // 用户端首页
    meta: { title: '用户首页', roles: ['user'] }
  },

  // 管理端统一工作台（管理员/医生共用同一壳组件）
  {
    path: '/portal',
    component: RoleDashboard, // 共享工作台壳组件
    meta: { title: '工作台', roles: ['admin', 'doctor'] },
    children: [
      // 角色独立子页（相对路径，确保 /portal 作为父路由时由 router-view 正确渲染）
      {
        path: 'admin',
        name: 'AdminHome',
        component: AdminHome,
        meta: { title: '管理员首页', roles: ['admin'] }
      },
      {
        path: 'doctor',
        name: 'DoctorHome',
        component: DoctorHome,
        meta: { title: '医生首页', roles: ['doctor'] }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 可选：全局前置守卫，设置页面标题
router.beforeEach(async (to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  // 1) 设置页面标题
  if (to.meta?.title) {
    document.title = String(to.meta.title)
  }

  // 2) 动态读取用户状态，避免循环依赖
  const { useUserStore } = await import('@/stores/user')
  const store = useUserStore()

  // 已登录判定：依赖已拉取的用户信息（基于 Cookie 的会话）
  const isAuthed = !!store.userInfo
  // 从后端用户信息中读取角色（建议后端返回 'user' | 'doctor' | 'admin'）
  const role = (store.userInfo?.role || '') as 'user' | 'doctor' | 'admin' | ''

  // 工具函数：根据角色跳到各自首页
  const redirectHomeByRole = (r: 'user' | 'doctor' | 'admin' | '') => {
    if (r === 'user') return next('/client')
    // 管理端统一入口，同一页面内容区由角色决定
    if (r === 'doctor' || r === 'admin') return next('/portal')
    return next('/login')
  }

  // 当前路由要求的角色集合（如果没有要求，表示公共路由）
  const requiredRoles = (to.meta?.roles as string[] | undefined)

  // 3) 已登录访问登录页：根据角色重定向到对应入口
  if (isAuthed && to.path === '/login') {
    return redirectHomeByRole(role)
  }

  // 4) 未登录访问受限路由：统一跳转登录
  if (!isAuthed && requiredRoles && requiredRoles.length > 0) {
    return next('/login')
  }

  // 5) 已登录但角色不匹配：重定向到角色首页
  if (isAuthed && requiredRoles && requiredRoles.length > 0) {
    if (!role || !requiredRoles.includes(role)) {
      return redirectHomeByRole(role)
    }
  }

  // 6) 其余情况放行
  next()
})

export default router