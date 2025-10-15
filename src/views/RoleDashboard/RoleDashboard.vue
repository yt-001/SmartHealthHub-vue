<template>
  <!-- 管理端统一工作台壳组件：管理员/医生共用 -->
  <div class="dashboard-container">
    <!-- 顶部栏：左-中-右 三段式 -->
    <el-header class="dashboard-header">
      <!-- 固定品牌列：独立出来，与侧边栏等宽 -->
      <div class="header-brand">
        <div class="brand">
          <span class="logo">🏥</span>
          <span class="title">智康云社</span>
        </div>
      </div>
      <!-- 左侧：仅保留工作台图标按钮 -->
      <div class="header-left">
        <el-tooltip content="工作台" placement="bottom">
          <el-button class="square-icon-btn" type="primary" @click="workDialogVisible = true">
            <el-icon><Grid /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
      <!-- 中间：搜索框（更长更高，按钮改为内部搜索图标） -->
      <div class="header-center">
        <div class="search-box">
          <el-input
            v-model="searchText"
            placeholder="搜索功能、患者、页面..."
            clearable
            size="small"
            @keyup.enter="onSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <!-- 将外部按钮改为输入框内部的搜索图标 -->
            <template #suffix>
              <el-icon style="cursor:pointer" @click="onSearch"><Search /></el-icon>
            </template>
          </el-input>
        </div>
      </div>

      <!-- 右侧：角色标签 + 头像下拉 + 主题切换（替换掉“回到入口”） -->
      <div class="header-right">
        <!-- 当前角色显示（Element Plus 标签） -->
        <el-tag :type="role === 'admin' ? 'primary' : role === 'doctor' ? 'success' : 'info'">
          角色：{{ roleLabel }}
        </el-tag>

        <!-- 圆形主题切换按钮（明/暗） -->
        <el-tooltip :content="isDark ? '切换为亮色' : '切换为暗色'" placement="bottom">
          <el-button class="circle-icon-btn" @click="toggleTheme">
            <el-icon v-if="isDark"><Moon /></el-icon>
            <el-icon v-else><Sunny /></el-icon>
          </el-button>
        </el-tooltip>
        <!-- 头像下拉：个人中心 / 设置 / 退出登录 -->
        <el-dropdown trigger="click" @command="onUserCommand">
          <span class="el-dropdown-link" style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <el-avatar :size="28" :src="(store.userInfo as any)?.avatar || ''">
              <!-- 没有头像时显示用户图标 -->
              <el-icon v-if="!(store.userInfo as any)?.avatar"><UserFilled /></el-icon>
            </el-avatar>
            <span class="username">{{ (store.userInfo as any)?.nickname || (store.userInfo as any)?.name || '用户' }}</span>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item command="settings">设置</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        
      </div>
    </el-header>

    <!-- 工作弹窗：放在头部之后 -->
    <el-dialog
      v-model="workDialogVisible"
      title="工作台"
      width="560px"
    >
      <!-- 弹窗内容占位（可按需替换为你的快捷入口/公告/待办等） -->
      <div style="min-height:120px;">
        这里是工作台内容（示例）：可放快捷入口、公告、待办等。
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="workDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>

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

      <!-- 内容区：容器自身滚动；内部包一层避免 direction 影响内容 -->
      <main class="content">
        <div class="content-inner">
          <router-view />
        </div>
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
import { computed, watch, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import doctorMenu from '@/router/menus/doctorMenu'
import adminMenu from '@/router/menus/adminMenu'
import type { DoctorMenuItem } from '@/router/menus/doctorMenu'
import type { AdminMenuItem } from '@/router/menus/adminMenu'
import { Search, UserFilled, Sunny, Moon, Grid } from '@element-plus/icons-vue'

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

// 中文标签
const roleLabel = computed(() => (role.value === 'admin' ? '管理员' : role.value === 'doctor' ? '医生' : '未知'))

// 当前角色对应的菜单（医生/管理员），当角色未知时返回空数组
const currentMenu = computed<(DoctorMenuItem | AdminMenuItem)[]>(() => {
  if (role.value === 'doctor') return doctorMenu as DoctorMenuItem[]
  if (role.value === 'admin') return adminMenu as AdminMenuItem[]
  return []
})

/* 顶部交互（中文注释） */
// 工作弹窗开关
const workDialogVisible = ref(false)
// 搜索关键字
const searchText = ref('')

// 执行搜索（点击内置搜索图标或回车触发）
const onSearch = () => {
  const q = searchText.value.trim()
  if (!q) return
  // 示例：router.push({ path: '/portal/search', query: { q } })
  console.debug('搜索：', q)
}

// 处理头像下拉菜单命令
const onUserCommand = (cmd: string) => {
  if (cmd === 'logout') {
    // 清空本地用户并回登录页
    store.clearUser()
    router.replace('/login')
  } else if (cmd === 'profile') {
    router.push('/portal/profile') // 若无路由将落到 404
  } else if (cmd === 'settings') {
    router.push('/portal/settings') // 若无路由将落到 404
  }
}

/* 主题切换：明/暗（将标记写入 html 根元素类名） */
const isDark = ref(localStorage.getItem('theme') === 'dark')
const applyTheme = () => {
  const el = document.documentElement
  if (isDark.value) {
    el.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    el.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}
const toggleTheme = () => {
  isDark.value = !isDark.value
  applyTheme()
}
onMounted(() => applyTheme())

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
</script>

<style scoped>
/* 布局容器 */
.dashboard-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* 改为固定视口高度，防止页面级滚动 */
  overflow: hidden; /* 禁止容器自身滚动 */
  background: var(--el-bg-color-page); /* 跟随主题的页面背景 */
}

/* 顶部栏样式 */
.dashboard-header {
  height: 56px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;              /* 增加左右区块间距，便于视觉区分 */
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

/* 品牌样式 */
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
  color: var(--el-text-color-primary);
}

/* 原 header-actions 保留，供右侧容器复用间距（若后续需要） */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 头部布局：左侧品牌固定与侧边栏等宽，右侧主区 */
.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
/* 品牌固定列（与侧边栏等宽），带分隔线与内边距 */
.header-brand {
  flex: 0 0 185px;
  box-sizing: border-box;
  padding-right: 12px;
  border-right: 1px solid var(--el-border-color-lighter);
  display: flex;
  align-items: center;
}
/* 左侧操作区（工作台按钮） */
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 0 12px;
}

/* 搜索框尺寸调整 */
.search-box {
  width: 320px;   /* 缩至一半 */
  max-width: 100%;
}
/* 提升输入高度与点击区域（仅影响本组件搜索框） */
:deep(.search-box .el-input__wrapper) {
  height: 36px;
}
:deep(.search-box .el-input__suffix) {
  cursor: pointer;
}

/* 正方形图标按钮（工作台） */
.square-icon-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

/* 圆形主题切换按钮 */
.circle-icon-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-lighter);
  height: 100%; /* 填满主体可视高度 */
  overflow-y: auto; /* 超出高度时出现垂直滚动条 */
  box-sizing: border-box; /* 关键：确保边框和内边距（以及滚动条）被包含在定义的宽度内，防止其撑开布局导致水平滚动条 */
  -webkit-overflow-scrolling: touch; /* 移动端滚动更顺滑 */
  scrollbar-width: thin; /* Firefox：细滚动条 */
  scrollbar-color: #c4ccd6 #f0f2f5; /* Firefox：拇指颜色 与 轨道颜色 */
}

/* 仅优化该侧边栏的滚动条样式（不影响全局） */
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
  color: var(--el-text-color-regular);
}

/* 内容区（滚动条固定在右侧） */
.content {
  flex: 1;
  background: var(--el-bg-color);
  margin: 12px;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  /* 关键：内容区自身滚动（仅纵向），头部与侧边栏不滚动 */
  min-height: 0;
  overflow-y: auto;   /* 纵向滚动 */
  overflow-x: hidden; /* 隐藏横向滚动，避免双滚动条 */
  scrollbar-gutter: stable both-edges; /* 滚动条出现/隐藏不抖动布局 */
  overscroll-behavior: contain;        /* 阻止惯性滚动穿透外层 */
}

/* 内容区滚动条样式（仅作用于该容器，随主题变化） */
.content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.content::-webkit-scrollbar-track {
  background: var(--el-fill-color-light);
  border-radius: 8px;
}
.content::-webkit-scrollbar-thumb {
  background: color-mix(in oklab, var(--el-text-color-disabled) 40%, transparent);
  border-radius: 8px;
}
.content::-webkit-scrollbar-thumb:hover {
  background: color-mix(in oklab, var(--el-text-color-secondary) 55%, transparent);
}
/* Firefox 自定义滚动条 */
.content {
  scrollbar-width: thin;
  scrollbar-color: color-mix(in oklab, var(--el-text-color-disabled) 40%, transparent) var(--el-fill-color-light);
}
.content-inner {
  /* 保持子内容正常撑开 */
  min-width: 0;
}
</style>