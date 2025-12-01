<template>
  <!-- 医生端-我的视频 -->
  <div style="padding:16px;" v-loading="loading">
    <div v-if="list.length > 0" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 320px)); gap: 16px; justify-content: start;">
      <MediaCard
        v-for="it in list"
        :key="it.id"
        :title="it.title"
        :description="it.description || '暂无简介'"
        :cover-url="it.coverImageUrl"
        primary-text="查看详情"
        secondary-text="编辑"
        :show-edit-left="showEdit"
        :view-count="it.viewCount"
        :author-name="it.authorName"
        :enable-cover-preview="true"
        @primary="onPrimary(it)"
        @secondary="onSecondary(it)"
      />
    </div>
    <el-empty v-else description="暂无视频数据" />
    
    <div style="margin-top: 20px; display: flex; justify-content: center;" v-if="total > 0">
       <el-pagination
         background
         layout="prev, pager, next"
         :total="total"
         v-model:current-page="pageNum"
         :page-size="pageSize"
         @current-change="loadList"
       />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import MediaCard from '@/components/MediaCard.vue'
import { fetchVideoReviewList } from '@/api/modules/video'

const router = useRouter()
const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(12)

const showEdit = ref(true)

const loadList = async () => {
  loading.value = true
  try {
    const res = await fetchVideoReviewList({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      query: {}
    })
    if (res.data) {
      list.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取视频列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadList()
})

/** 查看视频详情（进入发布页查看模式） */
const onPrimary = (it: any) => {
  router.push({ path: '/portal/doctor/video-publish', query: { id: it.id, mode: 'view' } })
}

/** 编辑视频（进入发布页编辑模式） */
const onSecondary = (it: any) => {
  router.push({ path: '/portal/doctor/video-publish', query: { id: it.id, mode: 'edit' } })
}
</script>

<style scoped>
/* 保留空样式块以便后续增强 */
</style>
