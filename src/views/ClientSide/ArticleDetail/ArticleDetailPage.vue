<template>
  <div class="article-detail-page">
    <!-- 背景装饰已移至 Layout -->

    <div class="page-content">
      <el-row :gutter="40">
        <!-- Left Column: Article Content, Info -->
        <el-col :span="16" :xs="24">
          <div class="content-card glass-card">
            <!-- Article Header -->
            <div class="article-header">
              <h1 class="title">{{ article.title }}</h1>
              <div class="meta-row">
                <span class="author-name">{{ article.authorName }}</span>
                <span class="sep">·</span>
                <span class="date">{{ article.publishDate }}</span>
                <span class="sep">·</span>
                <span class="views">{{ article.views }} 阅读</span>
              </div>
            </div>

            <!-- Article Content -->
            <div class="article-content" v-html="article.content"></div>
            
            <!-- Like/Share Section -->
            <div class="action-section">
                <LikeSection @share="showShare = true" />
            </div>
          </div>
        </el-col>
        
        <!-- Right Column: Author card & Comments -->
        <el-col :span="8" :xs="24" class="right-col">
          <div class="author-wrapper glass-card">
            <AuthorCard v-bind="author" class="transparent-bg" />
          </div>
          
          <!-- Comments Section -->
          <div class="comments-container glass-card">
            <CommentSection />
          </div>
        </el-col>
      </el-row>
    </div>

    <ShareModal v-model="showShare" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import CommentSection from '../VideoDetail/components/CommentSection.vue'
import LikeSection from '../VideoDetail/components/LikeSection.vue'
import ShareModal from '../VideoDetail/components/ShareModal.vue'
import AuthorCard from '../VideoDetail/components/AuthorCard.vue'

/**
 * 健康文章详情页
 * @description 展示文章内容、作者信息及评论区
 */

const route = useRoute()
const showShare = ref(false)

// Mock data for article
const article = ref({
  title: '春季流感高发，如何科学预防？',
  authorName: '社区卫生服务中心',
  publishDate: '2023-11-28',
  views: '1.2万',
  content: `
    <p>春季是流感的高发季节，气温多变，细菌病毒容易滋生。为了保障您和家人的健康，请注意以下几点预防措施：</p>
    <h3>1. 保持良好的个人卫生</h3>
    <p>勤洗手，使用肥皂或洗手液，并用流动水洗手。避免用手触摸眼睛、鼻子和嘴巴。</p>
    <h3>2. 保持室内空气流通</h3>
    <p>每天开窗通风，保持室内空气新鲜。避免去人群密集、空气不流通的场所。</p>
    <h3>3. 增强免疫力</h3>
    <p>均衡饮食，适量运动，充足睡眠，避免过度疲劳。</p>
    <h3>4. 接种流感疫苗</h3>
    <p>接种流感疫苗是预防流感最有效的手段，建议老年人、儿童、孕妇等重点人群及时接种。</p>
    <p>如果出现发热、咳嗽、咽痛等症状，请及时就医，并在医生指导下用药。</p>
  `
})

// Mock data for author (reusing the same structure as VideoDetail)
const author = {
  name: '社区卫生服务中心',
  avatar: 'https://picsum.photos/64/64',
  title: '主任医师',
  organization: '内科 · 社区卫生服务中心',
  followers: '3.2万',
  videos: '128',
  articles: '56',
  signature: '预防胜于治疗，用科学守护每一个家庭。',
  tags: ['预防医学', '慢病管理', '健康教育']
}
</script>

<style scoped>
.article-detail-page {
  position: relative;
  min-height: 100vh;
  background-color: transparent;
  overflow: hidden;
}

.page-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}

/* 通用毛玻璃卡片效果 */
.glass-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.04);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.glass-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.06);
}

.content-card {
  padding: 40px;
}

.author-wrapper {
  overflow: hidden; /* 确保内部圆角不溢出 */
}

/* 强制覆盖 AuthorCard 内部样式使其透明 */
:deep(.author-card) {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
}

.comments-container {
  margin-top: 24px;
  padding: 24px;
}

.article-header {
  margin-bottom: 32px;
}

.title {
  font-size: 32px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin-bottom: 16px;
  line-height: 1.4;
}

.meta-row {
  display: flex;
  align-items: center;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.sep {
  margin: 0 8px;
  opacity: 0.4;
}

.article-content {
  font-size: 18px;
  line-height: 1.8;
  color: var(--el-text-color-regular);
  margin-bottom: 40px;
}

/* Style for HTML content */
:deep(.article-content h3) {
  font-size: 24px;
  font-weight: 600;
  margin: 32px 0 16px;
  color: var(--el-text-color-primary);
}

:deep(.article-content p) {
  margin-bottom: 24px;
}

.action-section {
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .right-col {
    margin-top: 24px;
  }
  
  .content-card {
    padding: 24px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .article-content {
    font-size: 16px;
  }
}
</style>
