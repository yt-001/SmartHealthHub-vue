<template>
  <div class="video-hall" :style="containerStyle">
    <el-row :gutter="24">
      <!-- 左侧：轮播图 + 推荐栅格（填充轮播下方空白） -->
      <el-col :span="16" :xs="24">
        <el-card class="carousel-card" shadow="never" :body-style="{ padding: '0px' }">
          <el-carousel height="320px" indicator-position="none">
            <el-carousel-item v-for="(b, i) in banners" :key="i">
              <img class="banner" :src="b" alt="banner" />
            </el-carousel-item>
          </el-carousel>
        </el-card>

        <div class="recommend-grid">
          <RecommendedVideoCard
            v-for="rv in recommended"
            :key="rv.id"
            v-bind="rv"
            @click="goDetail"
          />
        </div>
      </el-col>

      <!-- 右侧：热门长条卡片列 -->
      <el-col :span="8" :xs="24">
        <div class="popular-list">
          <PopularVideoCard
            v-for="pv in popular"
            :key="pv.id"
            v-bind="pv"
            @click="goDetail"
          />
        </div>
      </el-col>
    </el-row>

    <!-- 上拉加载组件 -->
    <PullUpLoading
      :loading="isLoading"
      :has-more="hasMore"
      :pull-distance="pullDistance"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PopularVideoCard from './components/PopularVideoCard.vue'
import RecommendedVideoCard from './components/RecommendedVideoCard.vue'
import PullUpLoading from '@/components/PullUpLoading.vue'
import { usePullUpLoad } from '@/hooks/usePullUpLoad'
import { fetchPublicVideosPage } from '@/api/modules/video'
import type { HealthVideoVO } from '@/api/types/videoTypes'

/**
 * 视频大厅页面
 * @description 顶部为轮播图与右侧热门长条卡片；下方为推荐视频栅格
 * 集成了上拉加载更多功能
 */
const router = useRouter()

/**
 * 轮播图数据（占位）
 */
const banners: string[] = [
  'https://picsum.photos/1200/320?random=11',
  'https://picsum.photos/1200/320?random=12',
  'https://picsum.photos/1200/320?random=13'
]

// 定义组件使用的数据类型（适配后）
interface VideoCardData {
  id: string | number
  title: string
  cover: string
  videoUrl: string
  duration: string
  author: string
  views: string
  publishedAt: string
  tags?: string[]
  description?: string
}

/**
 * 热门视频列表（长条卡片）
 */
const popular = ref<VideoCardData[]>([])

/**
 * 推荐视频列表（栅格卡片）
 */
const recommended = ref<VideoCardData[]>([])

// 分页相关
const pageNum = ref(1)
const pageSize = 12 // 每页12条，适合栅格布局
const hasMore = ref(true)

/**
 * 格式化时长 (秒 -> mm:ss)
 */
const formatDuration = (seconds: number = 0): string => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

/**
 * 格式化观看量
 */
const formatViews = (count: number = 0): string => {
  if (count >= 10000) {
    return (count / 10000).toFixed(1) + '万'
  }
  return count.toString()
}

/**
 * 格式化时间（简单处理为日期）
 */
const formatTime = (dateStr: string): string => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  // 简单判断是否是最近几天
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 3600 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString()
}

/**
 * 数据适配器：API VO -> Component Props
 */
const adaptVideoData = (vo: HealthVideoVO): VideoCardData => {
  return {
    id: vo.id,
    title: vo.title,
    cover: vo.coverImageUrl || 'https://picsum.photos/360/200?random=' + vo.id, // 兜底图片
    videoUrl: vo.videoUrl,
    duration: formatDuration(vo.duration),
    author: vo.authorName || '未知作者',
    views: formatViews(vo.viewCount),
    publishedAt: formatTime(vo.createdAt),
    tags: vo.category ? [vo.category] : [], // 暂时只取一个分类
    description: vo.description
  }
}

/**
 * 初始化数据
 */
const initData = async () => {
  // 1. 获取热门视频 (按播放量倒序，取前3个)
  try {
    const res = await fetchPublicVideosPage({
      pageNum: 1,
      pageSize: 3,
      sortField: 'view_count', // 假设后端支持此字段排序
      sortDirection: 'DESC'
    })
    if (res.data?.list) {
      popular.value = res.data.list.map(adaptVideoData)
    }
  } catch (error) {
    console.error('获取热门视频失败:', error)
  }

  // 2. 获取推荐视频 (按发布时间倒序，第一页)
  pageNum.value = 1
  hasMore.value = true
  await loadMore()
}

/**
 * 加载更多视频
 */
const loadMore = async () => {
  if (!hasMore.value) return
  
  try {
    const res = await fetchPublicVideosPage({
      pageNum: pageNum.value,
      pageSize: pageSize,
      sortField: 'created_at',
      sortDirection: 'DESC'
    })
    
    const list = res.data?.list || []
    if (list.length > 0) {
      const newVideos = list.map(adaptVideoData)
      recommended.value.push(...newVideos)
      pageNum.value++
      
      // 如果返回数量小于分页大小，说明没有更多了
      if (list.length < pageSize) {
        hasMore.value = false
      }
    } else {
      hasMore.value = false
    }
  } catch (error) {
    console.error('加载视频列表失败:', error)
    hasMore.value = false
  }
}

/**
 * 使用上拉加载 Hook
 */
const { 
  pullDistance, 
  isLoading, 
  containerStyle 
} = usePullUpLoad({
  onLoad: loadMore,
  threshold: 60,
  maxDistance: 120,
  minLoadTime: 600
})

/**
 * 跳转详情页
 * @param id 视频ID
 */
const goDetail = (id: string | number) => {
  router.push(`/client/video/${id}`)
}

onMounted(() => {
  initData()
})
</script>

<style scoped>
/* 定义入场动画 */
@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translate3d(40px, 0, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate3d(0, 40px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

.video-hall {
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px 40px;
  min-height: 100%;
}

.carousel-card {
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  border: none;
  
  /* 轮播图淡入动画 */
  animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  opacity: 0;
}

.banner {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

/* 推荐视频网格 */
.recommend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* 推荐视频卡片交错动画 */
.recommend-grid > * {
  animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  opacity: 0;
}

.recommend-grid > *:nth-child(1) { animation-delay: 0.2s; }
.recommend-grid > *:nth-child(2) { animation-delay: 0.25s; }
.recommend-grid > *:nth-child(3) { animation-delay: 0.3s; }
.recommend-grid > *:nth-child(4) { animation-delay: 0.35s; }
.recommend-grid > *:nth-child(5) { animation-delay: 0.4s; }
.recommend-grid > *:nth-child(6) { animation-delay: 0.45s; }

/* 热门列表容器 */
.popular-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  /* 整体右侧滑入动画 */
  animation: fadeInRight 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  opacity: 0;
  animation-delay: 0.1s; /* 稍晚于主内容 */
}
</style>
