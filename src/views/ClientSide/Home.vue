<template>
  <div class="client-home-container" :style="containerStyle">
    <!-- 顶部区域：左轮播图 + 右热点榜单（1-10） -->
    <section class="top-section">
      <!-- 左：轮播图 -->
      <div class="carousel-wrap">
        <el-carousel indicator-position="none" :autoplay="carouselAutoplay" interval="4000" height="100%">
          <el-carousel-item v-for="(banner, idx) in banners" :key="idx">
            <div class="banner-item">
              <img
                class="banner-img"
                :src="banner.src"
                :alt="banner.title"
                :loading="idx === 0 ? 'eager' : 'lazy'"
                decoding="async"
              />
              <div class="banner-mask">
                <h3 class="banner-title">{{ banner.title }}</h3>
                <p class="banner-sub">{{ banner.subtitle }}</p>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </div>

      <!-- 右：热点榜单（1-10） -->
      <aside class="hot-list" ref="hotListRef">
        <div class="hot-header">热点</div>
        <ol class="hot-items">
          <li v-for="(item, i) in hotTopics" :key="item.id" class="hot-item" @click="onOpenArticle(item)" style="cursor: pointer;">
            <span class="rank">{{ i + 1 }}</span>
            <a href="javascript:void(0)" class="hot-link" :title="item.title">{{ item.title }}</a>
          </li>
        </ol>
      </aside>
    </section>

    <!-- 下方区域：热门文章列表（使用统一媒体卡片组件） -->
    <section class="articles-section">
      <div class="section-title">热门文章</div>
      <div class="articles-grid">
        <MediaCard
          v-for="it in articles"
          :key="it.id"
          :title="it.title"
          :description="it.summary"
          :cover-url="it.coverImageUrl"
          primary-text="查看详情"
          :show-edit-left="false"
          :view-count="it.viewCount || 0"
          :author-name="it.authorName || ''"
          :enable-cover-preview="false"
          @primary="onOpenArticle(it)"
        />
      </div>
    </section>
    
    <!-- 使用新的上拉加载组件 -->
    <PullUpLoading
      :loading="isLoading"
      :has-more="hasMore"
      :pull-distance="pullDistance"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onActivated, onDeactivated, onMounted, shallowRef } from 'vue'
import { useRouter } from 'vue-router'
import MediaCard from '@/components/MediaCard.vue'
import PullUpLoading from '@/components/PullUpLoading.vue'
import { usePullUpLoad } from '@/hooks/usePullUpLoad'
import { fetchPublicArticlesPage, fetchHotArticles } from '@/api/modules/article'
import { displayCarouselItems } from '@/api/modules/carouselItems'
import type { HealthArticleVO } from '@/api/types/articleTypes'

defineOptions({ name: 'ClientHomePage' })

type CacheEntry<T> = {
  t: number
  ttl: number
  v: T
}

/**
 * 从 localStorage 读取带 TTL 的缓存数据（过期或解析失败返回 null）
 */
const readCache = <T,>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const entry = JSON.parse(raw) as CacheEntry<T>
    if (!entry || typeof entry.t !== 'number' || typeof entry.ttl !== 'number') return null
    if (Date.now() - entry.t > entry.ttl) {
      localStorage.removeItem(key)
      return null
    }
    return entry.v ?? null
  } catch {
    return null
  }
}

/**
 * 将数据写入 localStorage，并附带 TTL（写入失败直接忽略）
 */
const writeCache = <T,>(key: string, value: T, ttlMs: number) => {
  try {
    const entry: CacheEntry<T> = { t: Date.now(), ttl: ttlMs, v: value }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch {
    /* ignore */
  }
}

/**
 * 在浏览器空闲时执行任务（无 requestIdleCallback 则降级为 setTimeout）
 */
const runWhenIdle = (fn: () => void) => {
  const w = window as any
  if (typeof w.requestIdleCallback === 'function') {
    w.requestIdleCallback(fn, { timeout: 800 })
  } else {
    window.setTimeout(fn, 0)
  }
}

/**
 * 获取用户端主滚动容器（与 usePullUpLoad 的 scrollTarget 一致）
 */
const getScrollContainer = (): HTMLElement | null => {
  const el = document.querySelector('.client-main')
  return (el as HTMLElement) || null
}

const CACHE_KEYS = {
  banners: 'shh:home:banners',
  hotTopics: 'shh:home:hot-topics',
  feed: 'shh:home:feed',
  scrollTop: 'shh:home:scroll-top'
} as const

const CACHE_TTLS = {
  banners: 30 * 60 * 1000,
  hotTopics: 2 * 60 * 1000,
  feed: 5 * 60 * 1000,
  scrollTop: 24 * 60 * 60 * 1000
} as const

const carouselAutoplay = ref(true)
let scrollSettleTimer: number | null = null

/**
 * 处理滚动时的性能降载：滚动中暂停轮播自动播放，滚动结束后恢复
 */
const handlePerfScroll = () => {
  carouselAutoplay.value = false
  if (scrollSettleTimer) window.clearTimeout(scrollSettleTimer)
  scrollSettleTimer = window.setTimeout(() => {
    carouselAutoplay.value = true
  }, 400)
}

/**
 * 绑定首页性能相关的滚动监听（只在首页激活时生效）
 */
const bindPerfScrollListener = () => {
  const el = getScrollContainer()
  if (!el) return
  el.addEventListener('scroll', handlePerfScroll, { passive: true })
}

/**
 * 解绑首页性能相关的滚动监听
 */
const unbindPerfScrollListener = () => {
  const el = getScrollContainer()
  if (!el) return
  el.removeEventListener('scroll', handlePerfScroll)
  if (scrollSettleTimer) window.clearTimeout(scrollSettleTimer)
  scrollSettleTimer = null
  carouselAutoplay.value = true
}

// 轮播图与热点数据
const banners = ref<any[]>([])
const hotTopics = shallowRef<HealthArticleVO[]>([])

// 加载轮播图
const loadBanners = async () => {
  try {
    const res = await displayCarouselItems()
    if (res.code === 200 && res.data) {
      const next = res.data.map(item => ({
        ...item,
        src: item.imageUrl,
        subtitle: item.description
      }))
      banners.value = next
      writeCache(CACHE_KEYS.banners, next, CACHE_TTLS.banners)
    }
  } catch (e) {
    console.error('加载轮播图失败', e)
  }
}

// 加载热点文章
const loadHotTopics = async () => {
  try {
    const res = await fetchHotArticles(10)
    if (res.code === 200) {
      hotTopics.value = res.data
      writeCache(CACHE_KEYS.hotTopics, res.data, CACHE_TTLS.hotTopics)
    }
  } catch (e) {
    console.error('加载热点文章失败', e)
  }
}

type HomeFeedCache = {
  articles: HealthArticleVO[]
  nextPageNum: number
  hasMore: boolean
}

// 文章列表与分页状态
const articles = shallowRef<HealthArticleVO[]>([])
const pageNum = ref(1)
const pageSize = 10
const hasMore = ref(true)

/**
 * 将首页文章列表与分页状态写入缓存（避免回到首页重复请求/重复渲染）
 */
const persistFeedCache = () => {
  const payload: HomeFeedCache = {
    articles: articles.value.slice(0, 60),
    nextPageNum: pageNum.value,
    hasMore: hasMore.value
  }
  writeCache(CACHE_KEYS.feed, payload, CACHE_TTLS.feed)
}

// 加载更多文章
const loadMore = async () => {
  if (!hasMore.value) return
  
  // 如果是首次加载（pageNum=1），可能不需要延迟，但这里是 loadMore，肯定是后续页
  try {
    const res: any = await fetchPublicArticlesPage({ pageNum: pageNum.value, pageSize, query: {} })
    const list: HealthArticleVO[] = res?.data?.list || []
    
    if (list.length > 0) {
      // 使用 shallowRef 需重新赋值触发更新
      articles.value = [...articles.value, ...list]
      pageNum.value += 1
      hasMore.value = list.length === pageSize
      persistFeedCache()
    } else {
      hasMore.value = false
      persistFeedCache()
    }
  } catch (e) {
    console.error(e)
  }
}

// 使用 hook 管理上拉加载
const { 
  pullDistance, 
  isLoading, 
  containerStyle 
} = usePullUpLoad({
  onLoad: loadMore,
  threshold: 60,
  maxDistance: 120,
  minLoadTime: 600, // 至少展示 0.6s
  scrollTarget: '.client-main' // 指定滚动容器为 .client-main
})

// 初始化加载第一页（不走上拉逻辑）
const initLoad = async () => {
  try {
    const res: any = await fetchPublicArticlesPage({ pageNum: 1, pageSize, query: {} })
    const list: HealthArticleVO[] = res?.data?.list || []
    articles.value = list
    pageNum.value = 2
    hasMore.value = list.length === pageSize
    persistFeedCache()
  } catch (e) {
    console.error(e)
  }
}

/**
 * 先从缓存恢复首页数据，再在空闲时静默刷新（SWR：stale-while-revalidate）
 */
const bootstrapHomeCache = () => {
  const cachedBanners = readCache<any[]>(CACHE_KEYS.banners)
  if (cachedBanners?.length) {
    banners.value = cachedBanners
  }

  const cachedHot = readCache<HealthArticleVO[]>(CACHE_KEYS.hotTopics)
  if (cachedHot?.length) {
    hotTopics.value = cachedHot
  }

  const cachedFeed = readCache<HomeFeedCache>(CACHE_KEYS.feed)
  if (cachedFeed?.articles?.length) {
    articles.value = cachedFeed.articles
    pageNum.value = Math.max(1, cachedFeed.nextPageNum || 2)
    hasMore.value = typeof cachedFeed.hasMore === 'boolean' ? cachedFeed.hasMore : true
  }

  runWhenIdle(() => {
    loadBanners()
    loadHotTopics()
    initLoad()
  })
}

/**
 * 还原首页滚动位置（配合 keep-alive 与本地缓存）
 */
const restoreScrollTop = () => {
  const cachedTop = readCache<number>(CACHE_KEYS.scrollTop)
  if (typeof cachedTop !== 'number') return
  const el = getScrollContainer()
  if (!el) return
  el.scrollTop = cachedTop
}

/**
 * 保存首页滚动位置（避免回到首页时重新从顶部开始）
 */
const persistScrollTop = () => {
  const el = getScrollContainer()
  if (!el) return
  writeCache(CACHE_KEYS.scrollTop, el.scrollTop, CACHE_TTLS.scrollTop)
}

onMounted(() => {
  bootstrapHomeCache()
  bindPerfScrollListener()
  runWhenIdle(() => restoreScrollTop())
})

onActivated(() => {
  bindPerfScrollListener()
  runWhenIdle(() => restoreScrollTop())
})

onDeactivated(() => {
  unbindPerfScrollListener()
  persistScrollTop()
})

const router = useRouter()

// 打开文章详情（保留）
const onOpenArticle = (it: HealthArticleVO) => {
  router.push(`/client/article/${it.id}`)
}
</script>

<style scoped>
/* 定义入场动画 */
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

/* 容器样式 */
.client-home-container {
  padding: 24px 40px;
  max-width: 1440px;
  margin: 0 auto;
  min-height: 100%;
}

/* 顶部区域：轮播 + 榜单 */
.top-section {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  margin-bottom: 40px;
  
  /* 添加动画：整体淡入上浮 */
  animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  opacity: 0; /* 初始隐藏 */
}

/* 轮播图区域 */
.carousel-wrap {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  height: 380px;
}

/* 强制 el-carousel 撑满容器 */
:deep(.el-carousel) {
  height: 100%;
}
:deep(.el-carousel__container) {
  height: 100%;
}
:deep(.el-carousel__item) {
  height: 100%;
}

.banner-item {
  width: 100%;
  height: 100%;
  position: relative;
}

.banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.banner-mask {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 40px 30px;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  color: #fff;
}

.banner-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.banner-sub {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
}

/* 热点榜单 */
.hot-list {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  height: 380px;
  display: flex;
  flex-direction: column;
}

.hot-header {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.hot-header::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 18px;
  background: var(--primary-color);
  margin-right: 10px;
  border-radius: 2px;
}

.hot-items {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden; /* 隐藏横向滚动条 */
}

.hot-item {
  display: flex;
  align-items: center;
  padding: 10px 4px; /* 左右留一点余地 */
  border-bottom: 1px solid #f5f5f5;
  transition: all 0.2s;
  width: 100%; /* 确保宽度不溢出 */
  box-sizing: border-box; /* 包含 padding */
}

.hot-item:last-child {
  border-bottom: none;
}

.hot-item:hover {
  background-color: #fcfcfc;
  transform: translateX(4px);
}

.rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: #f0f2f5;
  color: #999;
  font-size: 12px;
  font-weight: 700;
  border-radius: 4px;
  margin-right: 12px;
  flex-shrink: 0;
}

.hot-item:nth-child(1) .rank { background: #ff4d4f; color: #fff; }
.hot-item:nth-child(2) .rank { background: #ff7a45; color: #fff; }
.hot-item:nth-child(3) .rank { background: #ffa940; color: #fff; }

.hot-link {
  text-decoration: none;
  color: var(--text-main);
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.hot-link:hover {
  color: var(--primary-color);
}

/* 热门文章列表 */
.articles-section {
  margin-top: 20px;
}

.section-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 24px;
  padding-left: 12px;
  border-left: 5px solid var(--primary-color);
}

.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 24px;
}

.client-home-container :deep(.shh-card) {
  box-shadow: none;
}

/* 响应式调整 */
@media (max-width: 992px) {
  .top-section {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
  }
  .hot-list {
    height: 300px;
  }
  .articles-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}
</style>
