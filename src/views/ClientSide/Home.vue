<template>
  <div class="client-home-container" :style="containerStyle">
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
  minLoadTime: 600 // 至少展示 0.6s
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
/* 顶部两栏：左轮播（自适应宽度），右热点（固定宽度） */
.top-section {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 16px;
  padding: 16px 20px; /* 顶部区域可留少量内边距，避免紧贴边框 */
  align-items: stretch; /* 两侧卡片高度拉伸对齐 */
}
.carousel-wrap { 
  background: rgba(255, 255, 255, 0.6); 
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4); 
  border-radius: 8px; 
  overflow: hidden; 
  /* 高度由 el-carousel 的绑定值驱动 */ 
}
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
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.4);
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
