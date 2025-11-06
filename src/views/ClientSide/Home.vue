<template>
  <!-- 顶部区域：左轮播图 + 右热点榜单（1-10） -->
  <section class="top-section">
    <!-- 左：轮播图 -->
    <div class="carousel-wrap">
      <el-carousel indicator-position="none" autoplay interval="4000">
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

    <!-- 底部加载指示器（动态提示与拉伸效果） -->
    <div class="infinite-footer" :style="footerStyle">
      <div class="footer-content">
        <el-icon v-if="loadingMore" class="spin"><Loading /></el-icon>
        <span>{{ footerTip }}</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import banner1 from '@/assets/57-bg.png'
import banner2 from '@/assets/PersonalHome-Page.png'
import MediaCard from '@/components/MediaCard.vue'
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
const loadingMore = ref(false)

// 拉动加载交互状态
const isAtBottom = ref(false)
const pullDistance = ref(0)
const isPulling = ref(false)
let releaseTimer: number | null = null
const PULL_THRESHOLD = 60 // 触发加载的拉动阈值
const FRICTION_FACTOR = 0.4 // 拉动阻力系数
const FOOTER_BASE_HEIGHT = 64 // 底部指示器基础高度

// 动态计算底部指示器样式（应用拉伸和回弹动画）
const footerStyle = computed(() => ({
  height: `${FOOTER_BASE_HEIGHT + pullDistance.value}px`,
  transition: isPulling.value ? 'none' : `height 0.4s cubic-bezier(.17,1.51,.63,1.38)`,
}))

// 动态计算底部提示文案
const footerTip = computed(() => {
  if (!hasMore.value) return '没有更多数据了'
  if (loadingMore.value) return '正在加载...'
  if (pullDistance.value >= PULL_THRESHOLD) return '释放立即加载'
  return '继续下拉加载更多'
})

// 加载更多文章
const loadMore = async () => {
  if (!hasMore.value || loadingMore.value) return
  loadingMore.value = true
  const minMs = 1000 // 最小加载动画时长
  try {
    const [res] = await Promise.all([
      fetchPublicArticlesPage({ pageNum: pageNum.value, pageSize, query: {} }),
      new Promise<void>(resolve => setTimeout(resolve, minMs))
    ])
    const data: any = res as any
    const list: HealthArticleVO[] = data?.data?.list || []
    if (list.length > 0) {
      articles.value.push(...list)
      pageNum.value += 1
      hasMore.value = list.length === pageSize
    } else {
      hasMore.value = false
    }
  } finally {
    loadingMore.value = false
  }
}

// 释放拉动，触发判断
const releasePull = () => {
  isPulling.value = false
  if (pullDistance.value >= PULL_THRESHOLD && hasMore.value) {
    loadMore()
  }
  pullDistance.value = 0
  if (releaseTimer) clearTimeout(releaseTimer)
}

// 监听滚轮事件，实现拉动效果
const handleWheel = (event: WheelEvent) => {
  // 仅在页面底部、向下滚动且有更多数据时触发拉动
  if (isAtBottom.value && event.deltaY > 0 && hasMore.value) {
    // 阻止页面因拉动而产生的默认滚动（例如在某些设备上的"橡皮筋"效果）
    event.preventDefault()
    isPulling.value = true
    pullDistance.value += event.deltaY * FRICTION_FACTOR

    if (releaseTimer) clearTimeout(releaseTimer)
    releaseTimer = window.setTimeout(releasePull, 250) // 停止滚动 250ms 后释放
  }
}

// 监听滚动位置
const handleScroll = () => {
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
  const windowHeight = window.innerHeight
  const docHeight = document.documentElement.scrollHeight
  isAtBottom.value = scrollTop + windowHeight >= docHeight - 2 // 接近底部 2px 即视为触底
}

onMounted(() => {
  loadMore() // 首次加载
  window.addEventListener('scroll', handleScroll, { passive: true })
  // passive: false 确保 preventDefault 生效
  window.addEventListener('wheel', handleWheel, { passive: false })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('wheel', handleWheel)
  if (releaseTimer) clearTimeout(releaseTimer)
})

// 打开文章详情（保留）
const onOpenArticle = (it: HealthArticleVO) => {
  console.log('打开文章详情', it)
}
</script>

<style scoped>
/* 顶部两栏：左轮播（自适应宽度），右热点（固定宽度） */
.top-section {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
  padding: 16px 20px; /* 顶部区域可留少量内边距，避免紧贴边框 */
  align-items: stretch; /* 两侧卡片高度拉伸对齐 */
}
.carousel-wrap { background: var(--el-bg-color-page); border: 1px solid var(--el-border-color-lighter); border-radius: 8px; overflow: hidden; /* 高度由 el-carousel 的绑定值驱动 */ }
/* 让 el-carousel 撑满父容器高度（scoped 下使用 :deep 选择器） */
:deep(.el-carousel) { height: 100%; }
:deep(.el-carousel__container) { height: 100%; }
:deep(.el-carousel__item) { height: 100%; }
.banner-item {
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
}
.banner-mask {
  position: absolute;
  left: 0; right: 0; bottom: 0;
  padding: 16px 20px;
  background: linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0.0));
  color: #fff;
}
.banner-title { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
.banner-sub { font-size: 14px; opacity: .9; }

.hot-list {
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 12px 12px 8px;
  display: flex;
  flex-direction: column;
}
.hot-header { font-weight: 700; color: var(--primary-color); margin: 4px 6px 8px; }
.hot-items { list-style: none; margin: 0; padding: 0; flex: 1; }
.hot-item { display: flex; align-items: center; gap: 10px; padding: 8px 6px; border-radius: 6px; }
.hot-item:hover { background: var(--el-fill-color-light); }
.rank {
  width: 22px; height: 22px; line-height: 22px; text-align: center;
  border-radius: 50%;
  font-size: 12px; font-weight: 700;
  color: var(--accent-pink); background: rgba(224, 123, 145, 0.1);
}
.hot-item:nth-child(-n+3) .rank { color: var(--accent-yellow); background: rgba(255, 217, 102, 0.15); }
.hot-link { color: var(--el-text-color-regular); text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hot-link:hover { color: var(--primary-color); }

/* 热门文章区域 */
.articles-section { padding: 0 20px 24px; }
.section-title { font-weight: 700; color: var(--primary-color); margin: 6px 0 10px; }
.articles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 320px)); /* 动态列宽：280-320px，紧密相靠 */
  gap: 16px;
  justify-content: start; /* 保持左对齐，空位也保留 */
}

/* 在较宽屏幕上强制一行显示 5 个卡片 */
@media (min-width: 1400px) {
  .articles-grid {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
}

/* 小屏优化：热点区落到轮播下方 */
@media (max-width: 960px) {
  .top-section { grid-template-columns: 1fr;   }
}

/* 无限下拉加载底部指示器 */
.infinite-footer { display: flex; justify-content: center; align-items: center; }
.footer-content { display: flex; align-items: center; gap: 8px; color: var(--el-text-color-secondary); font-size: 14px; }
.footer-content .spin { animation: spin 1s linear infinite; }

</style>
