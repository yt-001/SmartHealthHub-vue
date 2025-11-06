<template>
  <!-- 医生端-视频发布：使用 MediaCard 展示占位数据 -->
  <div style="padding:16px; display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 320px)); gap: 16px; justify-content: start;">
    <MediaCard
      v-for="it in demoList"
      :key="it.id"
      :title="it.title"
      :description="it.desc"
      :cover-url="it.cover"
      primary-text="查看视频"
      secondary-text="编辑"
      :show-edit-left="showEdit"
      :view-count="it.views"
      :author-name="it.author"
      :enable-cover-preview="true"
      @primary="onPrimary(it)"
      @secondary="onSecondary(it)"
    />
  </div>
</template>
<script setup lang="ts">
// 中文注释：演示占位数据；后续替换为真实接口
import { ref } from 'vue'
import MediaCard from '@/components/MediaCard.vue'

const demoList = ref([
  { id: 1, title: '近视防控公开课', cover: 'https://picsum.photos/seed/video1/640/360', desc: '视频简介：科学用眼，合理作息...', views: 2219, author: '王医生' },
  { id: 2, title: '健康饮食与慢病管理', cover: 'https://picsum.photos/seed/video2/640/360', desc: '视频简介：均衡饮食的核心原则...', views: 1452, author: '赵医生' },
])

// 中文注释：切换左下角显示；true=编辑按钮，false=播放/点赞
const showEdit = ref(true)

const onPrimary = (it: any) => {
  // 中文注释：查看视频操作（后续替换为跳转）
  console.log('查看视频', it)
}

const onSecondary = (it: any) => {
  // 中文注释：编辑操作（后续替换为跳转）
  console.log('编辑视频', it)
}
</script>
<style scoped>
</style>
