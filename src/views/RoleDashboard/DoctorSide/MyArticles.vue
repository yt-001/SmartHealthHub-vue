<template>
  <!-- 医生端-我的文章：使用 MediaCard 展示占位数据 -->
  <div style="padding:16px; display:grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px;">
    <MediaCard
      v-for="it in demoList"
      :key="it.id"
      :title="it.title"
      :description="it.desc"
      :cover-url="it.cover"
      primary-text="查看详情"
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
  { id: 1, title: '如何防控近视', cover: 'https://picsum.photos/seed/near/640/360', desc: '青少年近视的成因与防控策略...', views: 1283, author: '张医生' },
  { id: 2, title: '冬季呼吸道防护指南', cover: 'https://picsum.photos/seed/winter/640/360', desc: '关于冬季常见呼吸道疾病与预防...', views: 842, author: '李医生' },
])

// 中文注释：切换左下角显示；true=编辑按钮，false=播放/点赞
const showEdit = ref(true)

const onPrimary = (it: any) => {
  // 中文注释：查看详情操作（后续替换为跳转）
  console.log('查看详情', it)
}

const onSecondary = (it: any) => {
  // 中文注释：编辑操作（后续替换为跳转）
  console.log('编辑文章', it)
}
</script>
<style scoped>
</style>
