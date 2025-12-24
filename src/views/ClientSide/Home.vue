<template>
  <div class="client-home-container" :style="containerStyle">
    <!-- 顶部区域：左轮播图 + 右热点榜单（1-10） -->
    <section class="top-section">
      <!-- 左：轮播图 -->
      <div class="carousel-wrap">
        <el-carousel indicator-position="none" autoplay interval="4000" height="100%">
          <el-carousel-item v-for="(banner, idx) in banners" :key="idx">
            <div class="banner-item" :style="{ backgroundImage: `url(${banner.src})` }">
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
          <li v-for="(item, i) in hotTopics" :key="item.id" class="hot-item">
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
          :enable-cover-preview="true"
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import banner1 from '@/assets/57-bg.png'
import banner2 from '@/assets/PersonalHome-Page.png'
import MediaCard from '@/components/MediaCard.vue'
import PullUpLoading from '@/components/PullUpLoading.vue'
import { usePullUpLoad } from '@/hooks/usePullUpLoad'
import { fetchPublicArticlesPage } from '@/api/modules/article'
import type { HealthArticleVO } from '@/api/types/articleTypes'

// 轮播图与热点数据（保留静态）
const banners = ref([
  { src: banner1, title: '关爱健康，从今天开始', subtitle: '科学管理，智慧守护您的每一天' },
  { src: banner2, title: '社区卫生服务', subtitle: '连接医生与用户，打造健康生态' },
])
const hotTopics = ref(
  Array.from({ length: 10 }).map((_, i) => ({ id: i + 1, title: `热点主题示例 ${i + 1}` }))
)

// 文章列表与分页状态
const articles = ref<HealthArticleVO[]>([])
const pageNum = ref(1)
const pageSize = 10
const hasMore = ref(true)

// 加载更多文章
const loadMore = async () => {
  if (!hasMore.value) return
  
  // 如果是首次加载（pageNum=1），可能不需要延迟，但这里是 loadMore，肯定是后续页
  try {
    const res: any = await fetchPublicArticlesPage({ pageNum: pageNum.value, pageSize, query: {} })
    const list: HealthArticleVO[] = res?.data?.list || []
    
    if (list.length > 0) {
      articles.value.push(...list)
      pageNum.value += 1
      hasMore.value = list.length === pageSize
    } else {
      hasMore.value = false
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
  } catch (e) {
    console.error(e)
  }
}
initLoad()

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
  background-size: cover;
  background-position: center;
  position: relative;
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
  grid-template-columns: repeat(5, 1fr);
  gap: 24px;
}

/* 列表项交错动画 */
.articles-grid > * {
  animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  opacity: 0;
}

/* 生成1-12个子元素的交错延迟 */
.articles-grid > *:nth-child(1) { animation-delay: 0.1s; }
.articles-grid > *:nth-child(2) { animation-delay: 0.15s; }
.articles-grid > *:nth-child(3) { animation-delay: 0.2s; }
.articles-grid > *:nth-child(4) { animation-delay: 0.25s; }
.articles-grid > *:nth-child(5) { animation-delay: 0.3s; }
.articles-grid > *:nth-child(6) { animation-delay: 0.35s; }
.articles-grid > *:nth-child(7) { animation-delay: 0.4s; }
.articles-grid > *:nth-child(8) { animation-delay: 0.45s; }
.articles-grid > *:nth-child(9) { animation-delay: 0.5s; }
.articles-grid > *:nth-child(10) { animation-delay: 0.55s; }
.articles-grid > *:nth-child(11) { animation-delay: 0.6s; }
.articles-grid > *:nth-child(12) { animation-delay: 0.65s; }

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
