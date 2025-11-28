<template>
  <div 
    class="popular-card" 
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
      <div class="meta-row">
        <span class="author">{{ author }}</span>
        <span class="sep">·</span>
        <span class="views">{{ views }}次观看</span>
        <!-- 如果需要显示时间，也可以加上 -->
        <!-- <span class="sep">·</span>
        <span>{{ publishedAt }}</span> -->
      </div>
      <div class="description" v-if="description || tags?.length">
        {{ description || tags?.join(' / ') }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { MoreFilled } from '@element-plus/icons-vue'

/**
 * 热门视频卡片组件
 * @description 细长横向排布，显示缩略图、标题、元信息与描述
 * @param id 视频ID
 * @param title 标题
 * @param cover 封面图地址
 * @param videoUrl 预览视频地址
 * @param duration 时长文本，如 12:30
 * @param author 作者/来源
 * @param views 观看量文本
 * @param publishedAt 发布时间文本
 * @param tags 标签列表
 * @param description 视频简介
 */
const props = defineProps<{
  id: string | number
  title: string
  cover: string
  videoUrl?: string
  duration: string
  author: string
  views: string
  publishedAt: string
  tags?: string[]
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
  
  playTimeout = window.setTimeout(() => {
    isPlaying.value = true
    nextTick(() => {
      if (videoRef.value) {
        videoRef.value.currentTime = 0
        videoRef.value.play().catch(() => {
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
.popular-card {
  display: flex;
  gap: 16px;
  cursor: pointer;
  background: transparent;
}

.thumb {
  position: relative;
  width: 240px; /* 固定宽度，或者用 flex 比例 */
  min-width: 240px;
  height: 135px; /* 16:9 */
  border-radius: 12px;
  overflow: hidden;
  background: #000;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-top: 4px;
  min-width: 0; /* 防止 flex 子项溢出 */
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 6px;
}

.title {
  font-size: 18px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.more-btn {
  font-size: 20px;
  color: var(--el-text-color-primary);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}
.popular-card:hover .more-btn {
  opacity: 1;
}

.meta-row {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 10px;
  min-width: 0; /* 允许子项收缩 */
}
.meta-row .sep { margin: 0 4px; font-weight: bold; }
.meta-row .author {
  color: var(--el-text-color-regular);
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* 优先对作者进行省略 */
}
.meta-row .views {
  flex: none;
  white-space: nowrap; /* 播放量必须完整显示 */
}

.description {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

@media (max-width: 768px) {
  .thumb { width: 160px; height: 90px; min-width: 160px; }
  .title { font-size: 15px; }
}
</style>
