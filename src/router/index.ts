import { createRouter, createWebHistory, RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import Login from '@/views/Login.vue'
import ClientHome from '@/views/ClientSide/ClientHome.vue'


import RoleDashboard from '@/views/RoleDashboard/RoleDashboard.vue'
import Error404 from '@/views/CommonErrors/Error404.vue'

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
        component: Error404,
        meta: { title: '管理员首页', roles: ['admin'] }
      },
      {
        path: 'doctor',
        name: 'DoctorHome',
        component: Error404,
        meta: { title: '医生首页', roles: ['doctor'] }
      },

      // 管理员端菜单占位子路由（相对路径，渲染到 RoleDashboard 的 router-view）
      { path: 'admin/dashboard', component: Error404, meta: { roles: ['admin'], title: '仪表盘' } },
      { path: 'admin/hospital-overview', component: Error404, meta: { roles: ['admin'], title: '医院情况' } },

      { path: 'admin/doctor-manage', component: () => import('@/views/RoleDashboard/AdminSide/DoctorManage.vue').then(m => m.default || m).catch(() => Error404), meta: { roles: ['admin'], title: '医生管理' } },
      { path: 'admin/patient-manage', component: () => import('@/views/RoleDashboard/AdminSide/PatientManage.vue').then(m => m.default || m).catch(() => Error404), meta: { roles: ['admin'], title: '患者管理' } },
      { path: 'admin/user-manage', component: () => import('@/views/RoleDashboard/AdminSide/UserManage.vue').then(m => m.default || m).catch(() => Error404), meta: { roles: ['admin'], title: '用户管理' } },
      { path: 'admin/case-archive-manage', component: () => import('@/views/RoleDashboard/AdminSide/CaseArchiveManage.vue').then(m => m.default || m).catch(() => Error404), meta: { roles: ['admin'], title: '病例档案管理' } },

      // 审核模块：医生/患者认证审核列表与详情
      { path: 'admin/doctor-cert-review', component: () => import('@/views/RoleDashboard/AdminSide/DoctorCertReviewList.vue').then(m => m.default || m).catch(() => Error404), meta: { roles: ['admin'], title: '医生认证审核' } },
      { path: 'admin/doctor-cert-review/:id', component: () => import('@/views/RoleDashboard/AdminSide/DoctorCertReviewDetail.vue').then(m => m.default || m).catch(() => Error404), meta: { roles: ['admin'], title: '医生认证详情' } },

      { path: 'admin/patient-cert-review', component: () => import('@/views/RoleDashboard/AdminSide/PatientCertReviewList.vue').then(m => m.default || m).catch(() => Error404), meta: { roles: ['admin'], title: '患者认证审核' } },
      { path: 'admin/patient-cert-review/:id', component: () => import('@/views/RoleDashboard/AdminSide/PatientCertReviewDetail.vue').then(m => m.default || m).catch(() => Error404), meta: { roles: ['admin'], title: '患者认证详情' } },

      { path: 'admin/drug-catalog', component: Error404, meta: { roles: ['admin'], title: '药品目录' } },
      { path: 'admin/charge-items', component: Error404, meta: { roles: ['admin'], title: '收费项' } },
      { path: 'admin/diagnosis-codes', component: Error404, meta: { roles: ['admin'], title: '诊断编码' } },
      { path: 'admin/exam-items', component: Error404, meta: { roles: ['admin'], title: '检查项目' } },
      { path: 'admin/price-change-approval', component: Error404, meta: { roles: ['admin'], title: '价格变动走审批' } },

      { path: 'admin/department-maintain', component: Error404, meta: { roles: ['admin'], title: '科室维护' } },
      { path: 'admin/doctor-schedule', component: Error404, meta: { roles: ['admin'], title: '医生排班' } },
      { path: 'admin/holiday-schedule', component: Error404, meta: { roles: ['admin'], title: '节假日排班' } },
      { path: 'admin/outpatient-slots-preview', component: Error404, meta: { roles: ['admin'], title: '门诊号源预览' } },

      // 医生端菜单占位子路由（相对路径，渲染到 RoleDashboard 的 router-view）
      { path: 'doctor/patient-list', component: Error404, meta: { roles: ['doctor'], title: '患者列表' } },
      { path: 'doctor/emr', component: Error404, meta: { roles: ['doctor'], title: '电子病历' } },
      { path: 'doctor/visit-records', component: Error404, meta: { roles: ['doctor'], title: '就诊记录' } },
      { path: 'doctor/history-search', component: Error404, meta: { roles: ['doctor'], title: '历史诊疗查询' } },
      { path: 'doctor/e-prescription', component: Error404, meta: { roles: ['doctor'], title: '电子处方' } },
      { path: 'doctor/exam-apply', component: Error404, meta: { roles: ['doctor'], title: '检查/检验申请' } },
      { path: 'doctor/diagnosis', component: Error404, meta: { roles: ['doctor'], title: '诊断记录' } },
      { path: 'doctor/medical-orders', component: Error404, meta: { roles: ['doctor'], title: '医嘱管理' } },
      { path: 'doctor/registration', component: Error404, meta: { roles: ['doctor'], title: '患者挂号信息' } },
      { path: 'doctor/appointment-review', component: Error404, meta: { roles: ['doctor'], title: '预约审核' } },
      { path: 'doctor/schedule', component: Error404, meta: { roles: ['doctor'], title: '医生排班查看' } },
      { path: 'doctor/statistics', component: Error404, meta: { roles: ['doctor'], title: '患者数据统计可视化' } },
      { path: 'doctor/profile', component: Error404, meta: { roles: ['doctor'], title: '医生个人信息' } },
      { path: 'doctor/account', component: Error404, meta: { roles: ['doctor'], title: '账户设置' } },
      { path: 'doctor/change-password', component: Error404, meta: { roles: ['doctor'], title: '密码修改' } },

      { path: 'profile', component: () => import('@/views/RoleDashboard/Profile.vue').then(m => m.default || m).catch(() => Error404), meta: { roles: ['admin', 'doctor'], title: '个人中心' } },
      { path: 'schedule', component: () => import('@/views/RoleDashboard/ScheduleCalendar.vue').then(m => m.default || m).catch(() => Error404), meta: { roles: ['admin', 'doctor'], title: '医生排班' } },

      // 子级兜底：当 /portal 下未匹配任何子路由时，在 RoleDashboard 的 router-view 内显示 404
      { path: ':catchAll(.*)', component: Error404, meta: { title: '未找到页面' } }
    ]
  },

  { path: '/:pathMatch(.*)*', name: 'NotFoundGlobal', component: Error404, meta: { title: '未找到页面' } }

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

  // 若刷新首跳时本地还未有用户信息，仅等待启动期的 bootstrap（不会重复请求）
  if (!store.userInfo) {
    try {
      await store.bootstrap()
    } catch {
      /* 忽略，后续逻辑按未登录处理 */
    }
  }

  // 已登录判定：依赖已拉取的用户信息（基于 Cookie 的会话）
  const isAuthed = !!store.userInfo
  // 规范化角色：后端可能返回 0/1/2 或 'user'/'admin'/'doctor'
  const rawRole = (store.userInfo as any)?.role
  const roleMap: Record<string | number, 'user' | 'doctor' | 'admin'> = {
    0: 'admin',
    1: 'doctor',
    2: 'user',
    user: 'user',
    admin: 'admin',
    doctor: 'doctor'
  }
  const role = (roleMap[rawRole] ?? '') as 'user' | 'doctor' | 'admin' | ''

  // 工具函数：根据角色跳到各自首页
  const redirectHomeByRole = (r: 'user' | 'doctor' | 'admin' | '') => {
    if (r === 'user') return next('/client')
    // 管理端统一入口，同一页面内容区由角色决定
    if (r === 'doctor' || r === 'admin') return next('/portal')
    return next('/login')
  }

  // 当前路由要求的角色集合（如果没有要求，表示公共路由）
  const requiredRoles = (to.meta?.roles as string[] | undefined)

  // 3) 已登录访问登录页：优先跳回 redirect，再按角色重定向到对应入口
  if (isAuthed && to.path === '/login') {
    const redirect = (to.query?.redirect as string) || ''
    if (redirect) return next(redirect)
    return redirectHomeByRole(role)
  }

  // 4) 未登录访问受限路由：统一跳转登录，并带上原路径以便回跳
  if (!isAuthed && requiredRoles && requiredRoles.length > 0) {
    return next({ path: '/login', query: { redirect: to.fullPath } })
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