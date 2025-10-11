<template>
  <!-- 管理端统一工作台壳组件：管理员/医生共用 -->
  <div class="dashboard-container">
    <!-- 顶部栏 -->
    <el-header class="dashboard-header">
      <div class="brand">
        <span class="logo">🏥</span>
        <span class="title">智康云社</span>
      </div>
      <div class="header-actions">
        <!-- 当前角色显示（Element Plus 标签） -->
        <el-tag :type="role === 'admin' ? 'primary' : role === 'doctor' ? 'success' : 'info'">
          角色：{{ roleLabel }}
        </el-tag>
        <el-button size="small" @click="goHome">回到入口</el-button>
      </div>
    </el-header>

    <div class="dashboard-body">
      <!-- 侧边栏（可根据角色显示不同菜单项） -->
      <aside class="sidebar">
        <div class="sidebar-section">导航</div>
        <el-menu
          :default-active="route.path"
          class="el-menu-vertical"
          :router="false"
        >
          <template v-for="group in currentMenu" :key="group.title">
            <el-sub-menu :index="group.title">
              <template #title>
                <!-- 仅使用菜单项自带图标字段，存在则展示 -->
                <el-icon v-if="group.icon" style="margin-right: 6px;">
                  <component :is="group.icon" />
                </el-icon>
                <span>{{ group.title }}</span>
              </template>
              <el-menu-item
                v-for="item in group.children || []"
                :key="item.path || item.title"
                :index="item.path || item.title"
                @click="item.path && router.push(item.path)"
              >
                <!-- 仅使用子项自带图标字段，存在则展示 -->
                <el-icon v-if="item.icon" style="margin-right: 6px;">
                  <component :is="item.icon" />
                </el-icon>
                <span>{{ item.title }}</span>
              </el-menu-item>
            </el-sub-menu>
          </template>
        </el-menu>
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
import doctorMenu from '@/router/menus/doctorMenu'
import adminMenu from '@/router/menus/adminMenu'
import type { DoctorMenuItem } from '@/router/menus/doctorMenu'
import type { AdminMenuItem } from '@/router/menus/adminMenu'

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


// 当前角色对应的菜单（医生/管理员），当角色未知时返回空数组
const currentMenu = computed<(DoctorMenuItem | AdminMenuItem)[]>(() => {
  if (role.value === 'doctor') return doctorMenu as DoctorMenuItem[]
  if (role.value === 'admin') return adminMenu as AdminMenuItem[]
  return []
})





// 根据角色跳转到对应子路由（仅在父路径 /portal 时触发）
const redirectByRoleIfNeeded = () => {
  if (route.path !== '/portal') return
  if (role.value === 'admin') {
    router.replace('/portal/admin')
  } else if (role.value === 'doctor') {
    router.replace('/portal/doctor')
  }
}

// 获取当前角色菜单的第一项路径（中文注释）
const getFirstMenuPath = (): string | null => {
  const groups = currentMenu.value || []
  if (!groups.length) return null
  const firstGroup = groups[0]
  const firstItem = (firstGroup.children || [])[0]
  return firstItem?.path || null
}

// 首次进入 /portal 时进行跳转
onMounted(() => {
  // 1) /portal 按角色跳转
  redirectByRoleIfNeeded()
  // 2) 进入 /portal/admin 或 /portal/doctor 时，若无具体子路由，默认跳转到菜单第一项
  if (route.path === '/portal/admin' || route.path === '/portal/doctor') {
    const p = getFirstMenuPath()
    if (p) router.replace(p)
  }
})

// 角色或当前路径变化时（如登录后角色写入、手动访问 /portal），进行跳转
watch([role, () => route.path, currentMenu], () => {
  // 角色或路径变化时处理
  redirectByRoleIfNeeded()
  // 当在角色首页且菜单已可用时，默认跳转第一项
  if (route.path === '/portal/admin' || route.path === '/portal/doctor') {
    const p = getFirstMenuPath()
    if (p) router.replace(p)
  }
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
  height: 100vh; /* 改为固定视口高度，防止页面级滚动 */
  overflow: hidden; /* 禁止容器自身滚动 */
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

.role-admin { background-color: #409eff; }  /* 管理员：蓝色 */
.role-doctor { background-color: #36cfc9; } /* 医生：青色 */
.role-unknown { background-color: #909399; } /* 未知：灰色 */



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
  height: 100%; /* 填满主体可视高度 */
  overflow-y: auto; /* 超出高度时出现垂直滚动条 */
  box-sizing: border-box; /* 关键：确保边框和内边距（以及滚动条）被包含在定义的宽度内，防止其撑开布局导致水平滚动条 */
  -webkit-overflow-scrolling: touch; /* 移动端滚动更顺滑 */
  scrollbar-width: thin; /* Firefox：细滚动条 */
  scrollbar-color: #c4ccd6 #f0f2f5; /* Firefox：拇指颜色 与 轨道颜色 */
}

/* 仅优化该侧边栏的滚动条样式（不影响全局） */
/* WebKit 系浏览器（Chrome/Edge/Safari） */
.sidebar::-webkit-scrollbar {
  width: 8px; /* 滚动条宽度 */
}
.sidebar::-webkit-scrollbar-track {
  background: #f0f2f5; /* 轨道背景 */
  border-radius: 8px;
}
.sidebar::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #d9dfe7, #c4ccd6);
  border-radius: 8px;
}
.sidebar::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #c7ced8, #b3bcc8);
}
.sidebar-section {
  padding: 12px 16px;
  font-weight: 600;
  color: #606266;
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