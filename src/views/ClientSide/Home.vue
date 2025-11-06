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
        v-for="it in hotArticles"
        :key="it.id"
        :title="it.title"
        :description="it.summary"
        :cover-url="it.cover"
        primary-text="查看详情"
        :show-edit-left="false"
        :view-count="it.views"
        :author-name="it.author"
        :enable-cover-preview="true"
        @primary="onOpenArticle(it)"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
// 首页布局与占位数据（中文注释）
import { ref } from 'vue'
import banner1 from '@/assets/57-bg.png'
import banner2 from '@/assets/PersonalHome-Page.png'
import MediaCard from '@/components/MediaCard.vue'

// 轮播图数据（占位）
const banners = ref([
  { src: banner1, title: '关爱健康，从今天开始', subtitle: '科学管理，智慧守护您的每一天' },
  { src: banner2, title: '社区卫生服务', subtitle: '连接医生与用户，打造健康生态' },
])

// 热点榜单（1-10，占位）
const hotTopics = ref(
  Array.from({ length: 10 }).map((_, i) => ({ id: i + 1, title: `热点主题示例 ${i + 1}` }))
)

// 热门文章（模拟数据）
const hotArticles = ref([
  { id: 1, title: '如何防控近视', cover: 'https://picsum.photos/seed/near/640/360', summary: '青少年近视的成因与防控策略...', views: 1283, author: '张医生' },
  { id: 2, title: '冬季呼吸道防护指南', cover: 'https://picsum.photos/seed/winter/640/360', summary: '关于冬季常见呼吸道疾病与预防...', views: 842, author: '李医生' },
  { id: 3, title: '健康饮食与慢病管理', cover: 'https://picsum.photos/seed/food/640/360', summary: '均衡饮食的核心原则与实践建议...', views: 1452, author: '赵医生' },
  { id: 4, title: '睡眠与免疫力', cover: 'https://picsum.photos/seed/sleep/640/360', summary: '提升睡眠质量有助于增强免疫力...', views: 966, author: '王医生' },
  { id: 5, title: '春季过敏防护手册', cover: 'https://picsum.photos/seed/allergy/640/360', summary: '识别常见过敏源并做好日常防护...', views: 731, author: '周医生' },
  { id: 6, title: '慢病运动处方', cover: 'https://picsum.photos/seed/exercise/640/360', summary: '为慢病人群制定科学的运动方案...', views: 1089, author: '钱医生' },
  { id: 7, title: '心理健康与压力管理', cover: 'https://picsum.photos/seed/stress/640/360', summary: '识别压力信号并进行有效管理...', views: 654, author: '孙医生' },
  { id: 8, title: '儿童疫苗接种指南', cover: 'https://picsum.photos/seed/vaccine/640/360', summary: '掌握关键接种节点与注意事项...', views: 2012, author: '吴医生' },
  { id: 9, title: '夏季防暑与补水', cover: 'https://picsum.photos/seed/summer/640/360', summary: '高温天气的健康守护建议...', views: 433, author: '郑医生' },
  { id: 10, title: '居家急救常识', cover: 'https://picsum.photos/seed/firstaid/640/360', summary: '掌握常见居家急救的正确方法...', views: 1588, author: '王医生' },
  { id: 11, title: '心血管健康管理', cover: 'https://picsum.photos/seed/heart/640/360', summary: '心血管疾病的早期识别与干预...', views: 1204, author: '刘医生' },
  { id: 12, title: '眼部护理基础', cover: 'https://picsum.photos/seed/eye/640/360', summary: '日常眼部护理与用眼卫生...', views: 587, author: '唐医生' },
])

// 打开文章详情（占位）
const onOpenArticle = (it: any) => {
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
.carousel-wrap { background: #fff; border: 1px solid #eef0f2; border-radius: 8px; overflow: hidden; /* 高度由 el-carousel 的绑定值驱动 */ }
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
  background: linear-gradient(to top, rgba(0,0,0,0.35), rgba(0,0,0,0.0));
  color: #fff;
}
.banner-title { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
.banner-sub { font-size: 14px; opacity: .9; }

.hot-list {
  background: #fff;
  border: 1px solid #eef0f2;
  border-radius: 8px;
  padding: 12px 12px 8px;
  display: flex;
  flex-direction: column;
}
.hot-header { font-weight: 700; color: #1f2d3d; margin: 4px 6px 8px; }
.hot-items { list-style: none; margin: 0; padding: 0; flex: 1; }
.hot-item { display: flex; align-items: center; gap: 10px; padding: 8px 6px; border-radius: 6px; }
.hot-item:hover { background: #f7f9fa; }
.rank {
  width: 22px; height: 22px; line-height: 22px; text-align: center;
  border-radius: 50%;
  font-size: 12px; font-weight: 700;
  color: #27b397; background: #e8f7f3;
}
.hot-link { color: #4c5564; text-decoration: none; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hot-link:hover { color: #1f2d3d; }

/* 热门文章区域（网格占位） */
.articles-section { padding: 0 20px 24px; }
.section-title { font-weight: 700; color: #1f2d3d; margin: 6px 0 10px; }
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
  .top-section { grid-template-columns: 1fr; }
}
</style>
