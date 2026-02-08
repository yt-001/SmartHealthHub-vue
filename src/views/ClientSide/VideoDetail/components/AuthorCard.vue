<template>
  <el-card class="author-card" shadow="never">
    <div class="top">
      <el-avatar :size="56" :src="avatarSrc" @error="handleAvatarError">
        {{ avatarText }}
      </el-avatar>
      <div class="info">
        <div class="name-row">
          <span class="name">{{ name }}</span>
          <el-tag size="small" type="success" effect="plain">{{ title }}</el-tag>
        </div>
        <div class="org">{{ organization }}</div>
        <div class="stats" v-if="showStats">
          <span>粉丝 {{ followers }}</span>
          <span class="dot">•</span>
          <span>视频 {{ videos }}</span>
          <span class="dot">•</span>
          <span>文章 {{ articles }}</span>
        </div>
      </div>
    </div>

    <div class="signature" v-if="signature">
      <el-icon><Edit /></el-icon>
      <span>{{ signature }}</span>
    </div>

    <div class="extras" v-if="tags?.length">
      <el-tag v-for="t in tags" :key="t" size="small" type="info" effect="plain">{{ t }}</el-tag>
    </div>

    <div class="actions">
      <el-button type="primary" size="small" round @click="handleFollow">关注</el-button>
      <el-button size="small" round @click="handleMessage">私信</el-button>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Edit } from '@element-plus/icons-vue'

/**
 * 作者信息卡片
 * @description 展示作者头像、基本信息、签名与扩展标签
 * @param name 作者名称
 * @param avatar 头像地址
 * @param title 作者头衔/职称
 * @param organization 机构/科室
 * @param followers 粉丝数
 * @param videos 视频数
 * @param articles 文章数
 * @param signature 个性签名
 * @param tags 额外标签，如擅长方向
 * @param showStats 是否展示粉丝/视频/文章统计
 */
const props = withDefaults(defineProps<{
  name: string
  avatar: string
  title: string
  organization: string
  followers?: string
  videos?: string
  articles?: string
  signature?: string
  tags?: string[]
  showStats?: boolean
}>(), {
  followers: '-',
  videos: '-',
  articles: '-',
  showStats: true
})

const avatarFailed = ref(false)

watch(() => props.avatar, () => {
  avatarFailed.value = false
})

/**
 * 获取头像占位文本：优先取姓名第一个字
 * @param name 姓名
 */
function getAvatarText(name: string) {
  const v = String(name || '').trim()
  return (v ? v.slice(0, 1) : '?') as string
}

const avatarText = computed(() => getAvatarText(props.name))
const avatarSrc = computed(() => (avatarFailed.value ? '' : (props.avatar || '')))

/**
 * 头像加载失败回调：回退为文字占位
 */
function handleAvatarError() {
  avatarFailed.value = true
}

/**
 * 关注作者
 */
const handleFollow = () => {
  ElMessage.success(`已关注 ${props.name}`)
}

/**
 * 私信作者
 */
const handleMessage = () => {
  ElMessage.info('私信功能待接入')
}
</script>

<style scoped>
.author-card { border-radius: 12px; }
.top { display: flex; gap: 14px; align-items: center; }
.info { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.name-row { display: flex; align-items: center; gap: 8px; }
.name { font-weight: 600; font-size: 16px; color: var(--el-text-color-primary); }
.org { font-size: 13px; color: var(--el-text-color-regular); }
.stats { display: flex; gap: 10px; font-size: 12px; color: var(--el-text-color-secondary); }
.stats .dot { opacity: 0.6; }

.signature { display: flex; align-items: center; gap: 6px; margin-top: 12px; padding: 10px; border: 1px dashed var(--el-border-color-lighter); border-radius: 8px; color: var(--el-text-color-regular); background: var(--el-fill-color-light); }
.extras { display: flex; gap: 6px; margin-top: 10px; }
.actions { display: flex; gap: 10px; margin-top: 12px; }
</style>
