<template>
  <!-- 管理员个人主页（中文注释） -->
  <div class="admin-profile-page">
    <!-- 头部信息卡片：头像 + 姓名 + 角色标签 + 简要信息 -->
    <el-card class="header-card" shadow="never">
      <div class="header-main">
        <el-avatar :size="72" :src="user.avatarUrl || ''">
          {{ (user.realName || user.username || '?').slice(0,1) }}
        </el-avatar>
        <div class="header-meta">
          <div class="name-line">
            <span class="real-name">{{ user.realName || '-' }}</span>
            <el-tag type="primary" round class="role-tag">{{ roleText(user.role) }}</el-tag>
          </div>
          <div class="sub-line">
            <el-icon><User /></el-icon>
            <span class="sub-item">{{ user.username || '-' }}</span>
            <el-divider direction="vertical" />
            <el-icon><Iphone /></el-icon>
            <span class="sub-item">{{ user.phone || '-' }}</span>
            <el-divider direction="vertical" />
            <el-icon><Message /></el-icon>
            <span class="sub-item">{{ user.email || '-' }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 详细信息卡片：分两列自适应的描述列表 -->
    <el-card class="detail-card" shadow="never">
      <div class="section-title">
        <el-icon><Document /></el-icon>
        <span>基本信息</span>
      </div>
      <el-descriptions
        :column="isNarrow ? 1 : 2"
        border
        :label-style="{ width: '120px' }"
      >
        <el-descriptions-item label="用户ID">{{ user.id ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="登录账号">{{ user.username || '-' }}</el-descriptions-item>
        <el-descriptions-item label="真实姓名">{{ user.realName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{ genderText(user.gender) }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ user.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ user.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="生日">{{ user.birthDate || '-' }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ roleText(user.role) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup lang="ts">
/* 管理员个人主页：展示 UserInfo 的所有字段，布局美观，中文注释 */
import { computed, onMounted, ref } from 'vue'
import { User, Iphone, Message, Document } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import type { UserInfo } from '@/typings'

/** 读取用户信息（从用户仓库） */
const store = useUserStore()
const user = computed<UserInfo>(() => (store.userInfo || ({} as any)) as UserInfo)

/** 响应式列数（窄屏 1 列，常规 2 列） */
const isNarrow = ref(false)
const updateNarrow = () => {
  isNarrow.value = window.innerWidth < 900
}
onMounted(() => {
  updateNarrow()
  window.addEventListener('resize', updateNarrow)
})

/** 工具函数：性别与角色的可读文本 */
const genderText = (g: string | undefined) => {
  if (!g) return '-'
  const s = String(g).toUpperCase()
  if (s === 'M' || s === '男') return '男'
  if (s === 'F' || s === '女') return '女'
  return String(g)
}
const roleText = (r: number | string | undefined) => {
  if (r === 0 || r === 'admin') return '管理员'
  if (r === 1 || r === 'doctor') return '医生'
  if (r === 2 || r === 'user') return '用户'
  return String(r ?? '-')
}
</script>

<style scoped>
.admin-profile-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 6%);
  min-height: 100%;
}

/* 头部卡片样式 */
.header-card {
  border: 1px solid var(--el-border-color-lighter);
}
.header-card :deep(.el-card__body) {
  padding: 16px;
}
.header-main {
  display: flex;
  align-items: center;
  gap: 16px;
}
.header-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.name-line {
  display: flex;
  align-items: center;
  gap: 10px;
}
.real-name {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}
.role-tag {
  transform: translateY(-1px);
}
.sub-line {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.sub-item {
  line-height: 1;
}

/* 详细信息卡片样式 */
.detail-card {
  border: 1px solid var(--el-border-color-lighter);
}
.detail-card :deep(.el-card__body) {
  padding: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--el-text-color-primary);
}
</style>