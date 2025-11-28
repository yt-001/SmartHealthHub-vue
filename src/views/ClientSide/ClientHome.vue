<template>
  <div class="client-layout">
    <!-- 背景容器：固定定位，防止溢出导致滚动条，且不影响 sticky 导航 -->
    <div class="bg-container">
      <div class="bg-decoration bg-orb-1"></div>
      <div class="bg-decoration bg-orb-2"></div>
      <div class="bg-decoration bg-grid"></div>
    </div>

    <!-- 顶部导航（用户端） -->
    <header class="client-navbar glass-nav" :class="{ 'is-scrolled': isScrolled }">
      <div class="nav-row">
        <!-- 左：品牌 Logo -->
        <div class="brand" @click="$router.push('/client/home')">
          <div class="brand-icon">
            <el-icon><Monitor /></el-icon>
          </div>
          <span class="brand-text">SmartHealthHub</span>
        </div>

        <!-- 中：主导航（居中） -->
        <nav class="main-nav">
          <RouterLink class="nav-item" active-class="active" to="/client/home">首页</RouterLink>
          <RouterLink class="nav-item" active-class="active" to="/client/health">健康资讯</RouterLink>
          <RouterLink class="nav-item" active-class="active" to="/client/video">视频大厅</RouterLink>
          <RouterLink class="nav-item" active-class="active" to="/client/blog">专家博客</RouterLink>
          <RouterLink class="nav-item" active-class="active" to="/client/team">名医团队</RouterLink>
        </nav>

        <!-- 右：登录入口或用户信息下拉 -->
        <div class="right-slot">
          <!-- 未登录：登录按钮 -->
          <button v-if="!isLoggedIn" class="login-btn" @click="$router.push('/login')">
            <span>登录 / 注册</span>
          </button>

          <!-- 已登录：头像+昵称+下拉 -->
          <el-dropdown v-else trigger="click" @command="onMenuCommand" popper-class="user-dropdown-popper">
            <div class="user-entry">
              <el-avatar :size="36" :src="avatarUrl || undefined" class="user-avatar">{{ initials }}</el-avatar>
              <span class="nickname">{{ displayName }}</span>
              <el-icon class="caret"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </header>

    <!-- 子页面容器 -->
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
  </div>
</template>

<script setup lang="ts">
// 用户端布局：顶部导航 + 子路由承载（中文注释）
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { ArrowDown, Monitor, User, SwitchButton } from '@element-plus/icons-vue'
import { logout as apiLogout } from '@/api/modules/user'

const router = useRouter()
const store = useUserStore()

// 滚动状态监听
const isScrolled = ref(false)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

// 登录态与用户基本信息
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
/* 全局布局容器：管理背景色与层级 */
.client-layout {
  position: relative;
  min-height: 100vh;
  background-color: #f2f7f5; /* 极淡的医疗绿灰 */
  /* 移除 overflow-x: hidden 以修复 sticky 导航失效及双滚动条问题 */
}

/* 背景容器：固定全屏，处理溢出 */
.bg-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
}

/* 背景装饰 - 创意抽象元素 */
.bg-decoration {
  position: absolute;
  z-index: 0;
  pointer-events: none;
}

/* 左上角柔和蓝光 - 增加流动动画 */
.bg-orb-1 {
  top: -100px;
  left: -100px;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(64, 158, 255, 0.12) 0%, rgba(64, 158, 255, 0) 70%);
  border-radius: 50%;
  filter: blur(40px);
  animation: float 10s ease-in-out infinite;
}

/* 右下角柔和青光 - 增加流动动画 */
.bg-orb-2 {
  bottom: -100px;
  right: -50px;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(103, 194, 58, 0.1) 0%, rgba(103, 194, 58, 0) 70%);
  border-radius: 50%;
  filter: blur(60px);
  animation: float 14s ease-in-out infinite reverse;
}

/* 背景网格纹理 */
.bg-grid {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(64, 158, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(64, 158, 255, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
  mask-image: radial-gradient(circle at center, black 40%, transparent 100%);
}

/* 流动浮动动画 */
@keyframes float {
  0% { transform: translate(0, 0); }
  50% { transform: translate(30px, 50px); }
  100% { transform: translate(0, 0); }
}

/* 顶部导航容器 */
.client-navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;
  background: transparent;
  border-bottom: 1px solid transparent;
  padding: 10px 0; /* 初始内边距 */
}

/* 滚动后的导航栏样式 */
.client-navbar.is-scrolled {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  padding: 0; /* 滚动后收缩 */
}

/* 内容区域：确保在背景之上 */
.client-main {
  position: relative;
  z-index: 1;
}

/* 三栏：左品牌 / 中导航 / 右用户信息 */
.nav-row {
  display: grid;
  grid-template-columns: 240px 1fr 240px; /* 两侧固定宽，中间自适应 */
  align-items: center;
  padding: 12px 40px;
  max-width: 1440px;
  margin: 0 auto;
}

/* 品牌 Logo */
.brand {
  justify-self: start;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}
.brand-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light-7));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  box-shadow: 0 4px 10px rgba(5, 150, 105, 0.2);
}
.brand-text {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(120deg, var(--text-main), var(--primary-color));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: -0.5px;
}

/* 居中主导航 */
.main-nav {
  justify-self: center;
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.5);
  padding: 6px;
  border-radius: 99px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
  backdrop-filter: blur(4px);
}

.nav-item {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  padding: 8px 20px;
  border-radius: 24px;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  font-size: 15px;
}

.nav-item:hover {
  color: var(--primary-color);
  background-color: var(--primary-light-9);
}

.nav-item.active {
  background-color: var(--primary-color);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.25);
}

/* 右侧登录/用户信息 */
.right-slot {
  justify-self: end;
  display: flex;
  align-items: center;
}

.login-btn {
  appearance: none;
  border: none;
  background: var(--primary-color);
  color: #fff;
  padding: 10px 24px;
  border-radius: 99px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.2);
}
.login-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(5, 150, 105, 0.3);
}

.user-entry {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 6px 12px 6px 6px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}
.user-entry:hover {
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transform: translateY(-1px);
}
.nickname {
  color: var(--text-main);
  font-weight: 600;
  font-size: 14px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.caret {
  color: var(--text-placeholder);
  font-size: 12px;
  transition: transform 0.2s;
}
.el-dropdown-menu__item {
  gap: 8px;
}

/* 主体内容容器 */
.client-main {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: calc(100vh - 80px);
}

.fullscreen-loading {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  z-index: 9999;
}
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--primary-light-8);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
}
.loading-text { margin-top: 16px; color: var(--primary-color); font-weight: 600; letter-spacing: 1px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* 渐隐过渡 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* 响应式调整 */
@media (max-width: 1024px) {
  .nav-row {
    padding: 12px 20px;
    grid-template-columns: auto 1fr auto;
  }
  .main-nav {
    display: none; /* 移动端暂隐，后续可加汉堡菜单 */
  }
}
</style>
