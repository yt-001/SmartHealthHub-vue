<template>
  <!-- 顶部导航（用户端）：左品牌 / 中居中导航 / 右用户信息 -->
  <header class="client-navbar">
    <div class="nav-row">
      <!-- 左：品牌 Logo（文字） -->
      <div class="brand" @click="$router.push('/client/home')">SmartHealthHub</div>

      <!-- 中：主导航（居中） -->
      <nav class="main-nav">
        <RouterLink class="nav-item" active-class="active" to="/client/home">首页</RouterLink>
        <RouterLink class="nav-item" active-class="active" to="/client/health">健康</RouterLink>
        <RouterLink class="nav-item" active-class="active" to="/client/blog">博客</RouterLink>
        <RouterLink class="nav-item" active-class="active" to="/client/team">团队</RouterLink>
        <RouterLink class="nav-item" active-class="active" to="/client/share">分享</RouterLink>
      </nav>

      <!-- 右：登录入口或用户信息下拉 -->
      <div class="right-slot">
        <!-- 未登录：登录按钮 -->
        <button v-if="!isLoggedIn" class="login-btn" @click="$router.push('/login')">登录</button>

        <!-- 已登录：头像+昵称+下拉（悬停） -->
        <el-dropdown v-else trigger="hover" @command="onMenuCommand">
          <div class="user-entry">
            <el-avatar :size="32" :src="avatarUrl || undefined">{{ initials }}</el-avatar>
            <span class="nickname">{{ displayName }}</span>
            <el-icon class="caret"><ArrowDown /></el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人中心</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>

  <!-- 子页面容器（全宽显示） -->
  <main class="client-main">
    <router-view />
  </main>

  <!-- 退出登录全屏加载动画 -->
  <transition name="fade">
    <div v-if="isLoggingOut" class="fullscreen-loading">
      <div class="spinner"></div>
      <div class="loading-text">正在退出...</div>
    </div>
  </transition>
</template>

<script setup lang="ts">
// 用户端布局：顶部导航 + 子路由承载（中文注释）
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { logout as apiLogout } from '@/api/modules/user'

const router = useRouter()
const store = useUserStore()

// 登录态与用户基本信息（昵称优先 realName，退化为 username）
const isLoggedIn = computed(() => store.isLoggedIn)
const avatarUrl = computed(() => store.userInfo?.avatarUrl || '')
const displayName = computed(() => store.userInfo?.realName || store.userInfo?.username || '用户')

// 退出登录加载态
const isLoggingOut = ref(false)

// 头像占位：姓名首字的大写（中文取首字）
const initials = computed(() => {
  const name = displayName.value.trim()
  if (!name) return 'U'
  return name[0].toUpperCase()
})

// 下拉菜单命令处理
const onMenuCommand = async (cmd: string) => {
  if (cmd === 'profile') {
    await router.push('/portal/profile')
    return
  }
  if (cmd === 'logout') {
    isLoggingOut.value = true
    const minDurationMs = 1000
    const startMs = Date.now()
    try {
      await Promise.all([
        apiLogout().catch(() => {}),
        new Promise(resolve => setTimeout(resolve, minDurationMs))
      ])
    } finally {
      const elapsed = Date.now() - startMs
      if (elapsed < minDurationMs) {
        await new Promise(resolve => setTimeout(resolve, minDurationMs - elapsed))
      }
    }
    store.clearUser()
    ElMessage.success('已退出登录')
    await router.push('/client/home')
    isLoggingOut.value = false
  }
}
</script>

<style scoped>
/* 顶部导航容器：单行三栏布局 */
.client-navbar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #ffffff;
  border-bottom: 1px solid #eef0f2;
}

/* 三栏：左品牌 / 中导航 / 右用户信息 */
.nav-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr; /* 中间自适应宽度，整体居中 */
  align-items: center;
  padding: 12px 20px;
}
.brand {
  justify-self: start;
  font-size: 20px;
  font-weight: 700;
  color: #1f2d3d;
  letter-spacing: 0.2px;
  cursor: pointer;
}

/* 居中主导航 */
.main-nav {
  justify-self: center;
  display: flex;
  align-items: center;
  gap: 28px; /* 模块间距 */
}
.nav-item {
  color: #4c5564;
  text-decoration: none;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 8px;
  transition: background-color .2s ease, color .2s ease;
}
.nav-item:hover { background-color: #f4f6f8; color: #1f2d3d; }
.nav-item.active { background-color: #e8f7f3; color: #27b397; }

/* 右侧登录/用户信息 */
.right-slot { justify-self: end; display: flex; align-items: center; }
.login-btn {
  appearance: none;
  border: 1px solid #27b397;
  background: transparent;
  color: #27b397;
  padding: 6px 14px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: all .2s ease;
}
.login-btn:hover { background: #27b397; color: #fff; }

.user-entry {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  transition: background-color .2s ease;
}
.user-entry:hover { background: #f4f6f8; }
.nickname { color: #1f2d3d; font-weight: 600; }
.caret { color: #8b95a1; }

/* 主体内容容器（全宽，无边距） */
.client-main {
  width: 100%;
  margin: 0;
  padding: 0;
}
.fullscreen-loading {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(1px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  z-index: 999;
}
.spinner {
  width: 44px;
  height: 44px;
  border: 4px solid #e6f4f1;
  border-top-color: #27b397;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
.loading-text { margin-top: 12px; color: #1f2d3d; font-weight: 600; }
@keyframes spin { to { transform: rotate(360deg); } }

/* 渐隐过渡 */
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

</style>
