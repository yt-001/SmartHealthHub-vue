<template>
  <div class="video-hall">
    <el-row :gutter="24">
      <!-- 左侧：轮播图 + 推荐栅格（填充轮播下方空白） -->
      <el-col :span="16" :xs="24">
        <el-card class="carousel-card" shadow="never">
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
  </div>
  
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import PopularVideoCard from './components/PopularVideoCard.vue'
import RecommendedVideoCard from './components/RecommendedVideoCard.vue'

/**
 * 视频大厅页面
 * @description 顶部为轮播图与右侧热门长条卡片；下方为推荐视频栅格
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

/**
 * 热门视频列表（长条卡片）
 */
const popular = [
  { 
    id: 101, 
    title: '春季常见病预防与护理指南', 
    cover: 'https://picsum.photos/360/200?random=21', 
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '12:30', 
    author: '社区卫生服务中心', 
    views: '2.5万', 
    publishedAt: '3天前', 
    tags: ['热点', '健康讲座'],
    description: '本视频详细讲解了春季常见的感冒、过敏等疾病的预防措施，以及家庭护理的实用技巧，适合所有家庭观看学习。'
  },
  { 
    id: 102, 
    title: '高血压患者的科学饮食建议', 
    cover: 'https://picsum.photos/360/200?random=22', 
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '08:45', 
    author: '心内科张医生', 
    views: '1.1万', 
    publishedAt: '1周前', 
    tags: ['饮食', '心血管'],
    description: '张医生为您深度解析高血压患者的饮食禁忌，推荐科学的食谱搭配，帮助您通过饮食控制血压，保持健康。'
  },
  { 
    id: 103, 
    title: '久坐人群肩颈舒缓操（办公室版）', 
    cover: 'https://picsum.photos/360/200?random=23', 
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    duration: '06:15', 
    author: '康复理疗师', 
    views: '5万', 
    publishedAt: '2周前', 
    tags: ['康复', '运动'],
    description: '专门为办公室久坐人群设计的肩颈舒缓操，动作简单易学，每天5分钟，有效缓解肩颈酸痛。'
  }
]

/**
 * 推荐视频列表（栅格卡片）
 */
const recommended = [
  { id: 201, title: '儿童疫苗接种全攻略', cover: 'https://picsum.photos/360/240?random=31', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '15:10', author: '儿保科李医生', views: '3千', publishedAt: '5小时前', description: '带你了解每种常见疫苗的接种时间与注意事项，帮助家长科学安排接种计划。' },
  { id: 202, title: '糖尿病早期症状自测', cover: 'https://picsum.photos/360/240?random=32', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '05:20', author: '内分泌科王医生', views: '2.3万', publishedAt: '1天前', description: '通过几个简单的自测方法，及时识别糖尿病早期信号，尽早干预更有效。' },
  { id: 203, title: '春季流感如何正确预防', cover: 'https://picsum.photos/360/240?random=33', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '09:10', author: '社区健康', views: '8千', publishedAt: '2天前', description: '讲解春季流感的传播特点和预防措施，告诉你何时该打疫苗、如何提升免疫力。' },
  { id: 204, title: '5分钟护眼操，缓解用眼疲劳', cover: 'https://picsum.photos/360/240?random=34', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '04:12', author: '眼科朱医生', views: '1.8万', publishedAt: '3天前', description: '一套办公室随时可做的护眼操，缓解干涩与酸胀，坚持练习效果更佳。' },
  { id: 205, title: '老年人居家护理要点', cover: 'https://picsum.photos/360/240?random=35', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '10:05', author: '护理站', views: '6千', publishedAt: '4天前', description: '从饮食、活动到安全防护，全面梳理老年人居家护理的关键注意事项。' },
  { id: 206, title: '健康饮水的科学方法', cover: 'https://picsum.photos/360/240?random=36', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '07:02', author: '营养师王老师', views: '9千', publishedAt: '5天前', description: '揭秘喝水误区，教你根据年龄与场景选择合适的饮水量与方式。' },
  { id: 207, title: '防晒科普：夏季如何选择防晒', cover: 'https://picsum.photos/360/240?random=37', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '11:22', author: '皮肤科张医生', views: '5千', publishedAt: '6天前', description: '全面解析防晒指数、成分与涂抹方法，让你高效防晒不“假防晒”。' },
  { id: 208, title: '家庭急救常识速学', cover: 'https://picsum.photos/360/240?random=38', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '13:08', author: '急诊中心', views: '2万', publishedAt: '1周前', description: '遇到常见家庭意外如何应对？教你掌握黄金急救法则与正确处理步骤。' }
]

/**
 * 跳转详情页
 * @param id 视频ID
 */
const goDetail = (id: string | number) => {
  router.push(`/client/video/${id}`)
}
</script>

<style scoped>
.video-hall { max-width: 1400px; margin: 0 auto; padding: 24px; }
.carousel-card { border-radius: 12px; overflow: hidden; }
.banner { width: 100%; height: 100%; object-fit: cover; display: block; }

.popular-list { display: flex; flex-direction: column; gap: 16px; }
.recommend-grid { margin-top: 12px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
@media (max-width: 1200px) { .recommend-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 900px) { .recommend-grid { grid-template-columns: repeat(2, 1fr); } }

@media (max-width: 768px) {
  .video-hall { padding: 16px; }
}
</style>
