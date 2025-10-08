import { createRouter, createWebHistory, RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import Login from '@/views/Login.vue'
import UserPage from '@/views/UserPage.vue'
import SharedPortal from '@/views/AdminSide/SharedPortal.vue'
import AdminPage from '@/views/AdminPage.vue'
import DoctorPage from '@/views/DoctorPage.vue'


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
    path: '/user',
    name: 'User',
    component: UserPage,
    meta: { title: '用户首页', roles: ['user'] }
  },

  // 管理员与医生共用父路由，通过子路由 + meta.roles 区分可访问性
  {
    path: '/portal',
    component: SharedPortal,
    meta: { title: '工作台', roles: ['admin', 'doctor'] },
    children: [
      {
        path: 'admin',
        name: 'Admin',
        component: AdminPage,
        meta: { title: '管理员首页', roles: ['admin'] }
      },
      {
        path: 'doctor',
        name: 'Doctor',
        component: DoctorPage,
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
router.beforeEach((to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  if (to.meta?.title) {
    document.title = String(to.meta.title)
  }

  // 角色访问控制示例（后端接入后可启用）
  // 假设从 Pinia/Store 或 localStorage 获取到后端下发的用户角色
  // const userRole = (localStorage.getItem('userRole') || '') as 'admin' | 'doctor' | 'user' | ''
  // const requiredRoles = (to.meta?.roles as string[] | undefined)
  // if (requiredRoles && userRole && !requiredRoles.includes(userRole)) {
  //   return next('/login')
  // }

  next()
})

export default router