<template>
  <div class="like-section">
    <div class="action-item" @click="handleLike">
      <el-icon :size="24" :color="isLiked ? '#409eff' : 'inherit'" class="icon">
        <component :is="isLiked ? 'StarFilled' : 'Star'" />
      </el-icon>
      <span class="count">{{ likeCount }}</span>
      <span class="label">点赞</span>
    </div>
    
    <div class="action-item" @click="$emit('share')">
      <el-icon :size="24" class="icon"><Share /></el-icon>
      <span class="label">分享</span>
    </div>

    <div class="action-item">
      <el-icon :size="24" class="icon"><CollectionTag /></el-icon>
      <span class="label">收藏</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Star, StarFilled, Share, CollectionTag } from '@element-plus/icons-vue'

/**
 * 点赞区域组件
 * @description 包含点赞、分享、收藏等互动功能
 * @emits share 点击分享时触发
 */
const isLiked = ref(false)
const likeCount = ref(128)

const handleLike = () => {
  isLiked.value = !isLiked.value
  likeCount.value += isLiked.value ? 1 : -1
}

defineEmits(['share'])
</script>

<style scoped>
.like-section {
  display: flex;
  gap: 32px;
  padding: 16px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
  border-top: 1px solid var(--el-border-color-lighter);
  margin: 16px 0;
}
.action-item {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 8px;
  color: var(--el-text-color-regular);
  transition: all 0.3s;
  user-select: none;
}
.action-item:hover {
  color: var(--el-color-primary);
}
.icon {
  transition: transform 0.2s;
}
.action-item:active .icon {
  transform: scale(0.9);
}
.count {
  font-weight: 600;
  font-size: 16px;
}
.label {
  font-size: 14px;
}
</style>
