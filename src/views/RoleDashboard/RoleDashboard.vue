<template>
  <!-- 管理端统一工作台壳组件：管理员/医生共用 -->
  <div class="dashboard-container">
    <!-- 顶部栏 -->
    <header class="dashboard-header">
      <div class="brand">
        <span class="logo">🏥</span>
        <span class="title">社区卫生服务工作台</span>
      </div>
      <div class="header-actions">
        <!-- 当前角色显示 -->
        <span class="role-tag" :class="roleClass">角色：{{ roleLabel }}</span>
        <button class="action-btn" @click="goHome">回到入口</button>
      </div>
    </header>

    <div class="dashboard-body">
      <!-- 侧边栏（可根据角色显示不同菜单项） -->
      <aside class="sidebar">
        <div class="sidebar-section">导航</div>
        <ul class="menu">
          <li
            class="menu-item"
            :class="{ active: isActive('/portal/admin') }"
            v-if="role === 'admin'"
            @click="router.push('/portal/admin')"
          >
            管理员首页
          </li>
          <li
            class="menu-item"
            :class="{ active: isActive('/portal/doctor') }"
            v-if="role === 'doctor'"
            @click="router.push('/portal/doctor')"
          >
            医生首页
          </li>
          <!-- 可扩展更多菜单，根据角色控制显示 -->
        </ul>
      </aside>

      <!-- 内容区：router-view 根据当前子路由动态展示 -->
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 统一工作台壳组件：
 * - 顶部栏 + 侧边栏 + 内容区（内容区放置 router-view）
 * - 当访问 /portal（父路由本身）时，根据角色自动跳转到对应子路由：
 *   admin -> /portal/admin，doctor -> /portal/doctor
 * - 这样 router-view 会加载不同子页面，实现“根据角色动态读取标签（路由页面）”
 */
import { computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const store = useUserStore()

// 角色：从用户信息里读取（后端建议返回 'admin' | 'doctor'）
const role = computed<'admin' | 'doctor' | ''>(() => {
  const r = (store.userInfo as any)?.role
  // 兼容数字/字符串
  if (r === 0 || r === '0' || r === 'admin') return 'admin'
  if (r === 1 || r === '1' || r === 'doctor') return 'doctor'
  return ''
})

// 中文标签与样式 class
const roleLabel = computed(() => (role.value === 'admin' ? '管理员' : role.value === 'doctor' ? '医生' : '未知'))
const roleClass = computed(() => (role.value === 'admin' ? 'role-admin' : role.value === 'doctor' ? 'role-doctor' : 'role-unknown'))

// 是否处于激活路径（用于侧边栏高亮）
const isActive = (path: string) => route.path === path

// 根据角色跳转到对应子路由（仅在父路径 /portal 时触发）
const redirectByRoleIfNeeded = () => {
  if (route.path !== '/portal') return
  if (role.value === 'admin') {
    router.replace('/portal/admin')
  } else if (role.value === 'doctor') {
    router.replace('/portal/doctor')
  }
}

// 首次进入 /portal 时进行跳转
onMounted(() => {
  redirectByRoleIfNeeded()
})

// 角色或当前路径变化时（如登录后角色写入、手动访问 /portal），进行跳转
watch([role, () => route.path], () => {
  redirectByRoleIfNeeded()
})

// 顶部栏“回到入口”按钮：根据角色跳回统一入口
const goHome = () => {
  if (role.value === 'admin') router.push('/portal/admin')
  else if (role.value === 'doctor') router.push('/portal/doctor')
  else router.push('/login')
}
</script>

<style scoped>
/* 布局容器 */
.dashboard-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100vh;
  background: #f5f7fa; /* 浅灰背景 */
}

/* 顶部栏样式 */
.dashboard-header {
  height: 56px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-bottom: 1px solid #eaecef;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}
.logo {
  font-size: 20px;
}
.title {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.role-tag {
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 12px;
  color: #fff;
}
.role-admin { background-color: #409eff; }  /* 管理员：蓝色 */
.role-doctor { background-color: #36cfc9; } /* 医生：青色 */
.role-unknown { background-color: #909399; } /* 未知：灰色 */

.action-btn {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #fff;
  color: #606266;
  cursor: pointer;
}
.action-btn:hover {
  background: #f2f6fc;
}

/* 主体区域：侧边栏 + 内容区 */
.dashboard-body {
  display: flex;
  flex: 1;
  min-height: 0; /* 避免子元素高度溢出 */
}

/* 侧边栏 */
.sidebar {
  width: 200px;
  background: #ffffff;
  border-right: 1px solid #eaecef;
}
.sidebar-section {
  padding: 12px 16px;
  font-weight: 600;
  color: #606266;
}
.menu {
  list-style: none;
  margin: 0;
  padding: 6px;
}
.menu-item {
  padding: 10px 12px;
  margin: 4px 6px;
  border-radius: 6px;
  color: #606266;
  cursor: pointer;
}
.menu-item:hover {
  background: #f2f6fc;
}
.menu-item.active {
  background: #e6f1ff;
  color: #3a8ee6;
  font-weight: 600;
}

/* 内容区 */
.content {
  flex: 1;
  background: #ffffff;
  margin: 12px;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
</style>