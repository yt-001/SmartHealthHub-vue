<template>
  <div 
    class="recommend-card" 
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <div class="thumb">
      <img :src="cover" alt="cover" class="cover-img" v-show="!isPlaying" />
      <video
        v-if="videoUrl"
        ref="videoRef"
        class="preview-video"
        :src="videoUrl"
        muted
        loop
        v-show="isPlaying"
      ></video>
      <span class="duration">{{ duration }}</span>
    </div>
    <div class="info">
      <div class="title-row">
        <div class="title" :title="title">{{ title }}</div>
        <el-icon class="more-btn" @click.stop><MoreFilled /></el-icon>
      </div>
      <div class="meta">
        <span>{{ views }}次观看</span>
        <span class="dot">·</span>
        <span>{{ publishedAt }}</span>
      </div>
      <div v-if="description" class="desc">{{ description }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { MoreFilled } from '@element-plus/icons-vue'

/**
 * 推荐视频卡片组件
 * @description 扁宽矩形卡片，支持鼠标悬停静音预览
 * @param id 视频ID
 * @param title 标题
 * @param cover 封面图地址
 * @param videoUrl 预览视频地址
 * @param duration 时长文本
 * @param author 作者/来源
 * @param views 观看量文本
 * @param publishedAt 发布时间
 * @param description 描述文案（固定两行展示）
 */
const props = defineProps<{
  id: string | number
  title: string
  cover: string
  videoUrl?: string
  duration: string
  author: string
  views: string
  publishedAt?: string
  description?: string
}>()

const emit = defineEmits<{
  (e: 'click', id: string | number): void
}>()

const isPlaying = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)
let playTimeout: number | null = null

/**
 * 处理卡片点击，发出 click 事件
 */
const handleClick = () => {
  emit('click', props.id)
}

/**
 * 鼠标移入，延迟播放视频
 */
const handleMouseEnter = () => {
  if (!props.videoUrl) return
  
  // 延迟播放，避免快速划过时闪烁
  playTimeout = window.setTimeout(() => {
    isPlaying.value = true
    nextTick(() => {
      if (videoRef.value) {
        videoRef.value.currentTime = 0
        videoRef.value.play().catch(() => {
          // 自动播放可能被浏览器策略阻止
          isPlaying.value = false
        })
      }
    })
  }, 300)
}

/**
 * 鼠标移出，停止播放
 */
const handleMouseLeave = () => {
  if (playTimeout) {
    clearTimeout(playTimeout)
    playTimeout = null
  }
  
  if (isPlaying.value && videoRef.value) {
    videoRef.value.pause()
  }
  isPlaying.value = false
}
</script>

<style scoped>
.recommend-card {
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s;
  background: transparent; /* 图片1风格似乎没有明显的卡片背景色，或者很淡 */
}
.recommend-card:hover {
  transform: translateY(-2px);
}

.thumb {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
}
.cover-img, .preview-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.duration {
  position: absolute;
  right: 6px;
  bottom: 6px;
  background: rgba(0,0,0,0.8);
  color: #fff;
  padding: 2px 6px;
  font-size: 12px;
  font-weight: 500;
  border-radius: 4px;
  z-index: 2;
}

.info {
  padding: 12px 4px 0; /* 调整内边距 */
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 6px;
}

.title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.more-btn {
  font-size: 20px;
  color: var(--el-text-color-primary);
  cursor: pointer;
  opacity: 0; /* 默认隐藏，悬停显示? 或者图片1一直显示? 图片1一直显示 */
  opacity: 1; 
  margin-top: 2px;
}

.meta {
  display: flex;
  align-items: center;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.meta .dot {
  margin: 0 4px;
  font-weight: bold;
}

.desc {
  margin-top: 6px;
  color: var(--el-text-color-regular);
  font-size: 13px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* 固定两行高度 */
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
