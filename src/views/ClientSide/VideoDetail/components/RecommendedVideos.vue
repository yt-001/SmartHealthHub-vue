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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PopularVideoCard from '@/views/ClientSide/VideoHall/components/PopularVideoCard.vue'

/**
 * 推荐视频组件
 * @description 侧边栏推荐视频列表，复用细长卡片组件
 */
const router = useRouter()
const videos = ref([
  { id: 101, title: '高血压患者的日常饮食指南，这几点一定要注意', cover: 'https://picsum.photos/360/200?random=22', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '12:30', views: '1.2万', publishedAt: '2天前', author: '心内科张医生', description: '饮食宜清淡，控制钠盐，合理搭配膳食结构。' },
  { id: 102, title: '春季流感高发，如何正确预防？专家来支招', cover: 'https://picsum.photos/360/200?random=23', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '08:45', views: '8千', publishedAt: '5天前', author: '社区健康', description: '从接种疫苗到日常卫生措施，系统讲解高效预防。' },
  { id: 103, title: '糖尿病早期症状有哪些？自测一下', cover: 'https://picsum.photos/360/200?random=24', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '05:20', views: '2.3万', publishedAt: '1周前', author: '内分泌科王医生', description: '通过症状自测与血糖监测，尽早识别风险。' },
  { id: 104, title: '办公室久坐族必看！5分钟肩颈放松操', cover: 'https://picsum.photos/360/200?random=25', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '06:15', views: '5万', publishedAt: '2周前', author: '康复理疗师', description: '简单易学的缓解动作，提高肩颈灵活与舒适度。' },
  { id: 105, title: '儿童疫苗接种全攻略，家长收藏备用', cover: 'https://picsum.photos/360/200?random=26', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: '15:10', views: '3千', publishedAt: '1个月前', author: '儿保科李医生', description: '详细解读接种时间表与注意事项，家长必看。' }
])

/**
 * 点击跳转详情
 */
const goDetail = (id: string | number) => {
  router.push(`/client/video/${id}`)
}
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
