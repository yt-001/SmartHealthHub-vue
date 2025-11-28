<template>
  <div class="video-detail-page">
    <el-row :gutter="40">
      <!-- Left Column: Player, Info, Comments -->
      <el-col :span="16" :xs="24">
        <VideoPlayer 
          src="https://media.w3.org/2010/05/sintel/trailer.mp4" 
          poster="https://picsum.photos/1280/720"
        />
        
        <div class="video-info">
          <h1 class="title">社区健康讲座：春季常见病预防与护理指南</h1>
          <div class="meta-row">
            <span class="views">2.5万次观看</span>
            <span class="sep">·</span>
            <span class="date">2023-11-28 发布</span>
          </div>
          
          <LikeSection @share="showShare = true" />
          
        </div>

        <CommentSection />
      </el-col>
      
      <!-- Right Column: Author card + Recommendations -->
      <el-col :span="8" :xs="24" class="right-col">
        <AuthorCard v-bind="author" />
        <div style="height: 16px"></div>
        <RecommendedVideos />
      </el-col>
    </el-row>

    <ShareModal v-model="showShare" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import VideoPlayer from './components/VideoPlayer.vue'
import CommentSection from './components/CommentSection.vue'
import LikeSection from './components/LikeSection.vue'
import ShareModal from './components/ShareModal.vue'
import RecommendedVideos from './components/RecommendedVideos.vue'
import AuthorCard from './components/AuthorCard.vue'

/**
 * 视频详情页主页面
 * @description 组合各个功能组件，实现完整的视频播放页
 */
const showShare = ref(false)
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
.video-detail-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}
.video-info {
  margin-top: 20px;
}
.title {
  font-size: 22px;
  margin: 0 0 12px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-bottom: 12px;
}
.sep { margin: 0 2px; opacity: 0.6; }
.tag {
  margin-left: 4px;
}


@media (max-width: 768px) {
  .right-col {
    margin-top: 40px;
  }
}
</style>
