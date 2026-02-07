<template>
  <div class="recommended-videos">
    <h3 class="section-title">推荐视频</h3>
    <div class="video-list">
      <PopularVideoCard
        v-for="video in videos"
        :key="video.id"
        v-bind="video"
        @click="goDetail"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PopularVideoCard from '@/views/ClientSide/VideoHall/components/PopularVideoCard.vue'
import { fetchPublicVideosPage } from '@/api/modules/video'
import type { HealthVideoVO } from '@/api/types/videoTypes'

/**
 * 推荐视频组件
 * @description 侧边栏推荐视频列表，复用细长卡片组件
 */
interface VideoCardData {
  id: string | number
  title: string
  cover: string
  videoUrl: string
  duration: string
  author: string
  views: string
  publishedAt: string
  description?: string
}

const route = useRoute()
const router = useRouter()
const videos = ref<VideoCardData[]>([])

const formatDuration = (seconds: number = 0): string => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const formatViews = (count: number = 0): string => {
  if (count >= 10000) return (count / 10000).toFixed(1) + '万'
  return count.toString()
}

const formatTime = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 3600 * 24))

  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString()
}

const adaptVideoData = (vo: HealthVideoVO): VideoCardData => {
  return {
    id: vo.id,
    title: vo.title,
    cover: vo.coverImageUrl,
    videoUrl: vo.videoUrl,
    duration: formatDuration(vo.duration),
    author: vo.authorName || '未知作者',
    views: formatViews(vo.viewCount),
    publishedAt: formatTime(vo.createdAt),
    description: vo.description
  }
}

const loadRecommended = async () => {
  try {
    const res = await fetchPublicVideosPage({
      pageNum: 1,
      pageSize: 6,
      sortField: 'view_count',
      sortDirection: 'DESC'
    })

    const currentId = String(route.params.id || '')
    const list = (res.data?.list || [])
      .filter(v => String(v.id) !== currentId)
      .slice(0, 5)
      .map(adaptVideoData)

    videos.value = list
  } catch (error) {
    console.error('获取推荐视频失败:', error)
    videos.value = []
  }
}

/**
 * 点击跳转详情
 */
const goDetail = (id: string | number) => {
  router.push(`/client/video/${id}`)
}

onMounted(() => {
  loadRecommended()
})

watch(
  () => route.params.id,
  () => {
    loadRecommended()
  }
)
</script>

<style scoped>
.recommended-videos {
  padding-left: 10px;
}
.section-title {
  font-size: 18px;
  margin-bottom: 20px;
  font-weight: 600;
}
.video-list { display: flex; flex-direction: column; gap: 12px; }
</style>
