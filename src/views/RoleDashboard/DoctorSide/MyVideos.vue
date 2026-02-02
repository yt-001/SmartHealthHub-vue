<template>
  <!-- 医生端-我的视频 -->
  <div style="padding:16px;" v-loading="loading">
    <!-- 筛选区域 -->
    <div style="margin-bottom: 16px; display: flex; gap: 16px;">
      <el-select v-model="searchCategory" placeholder="选择分类" clearable style="width: 200px;" @change="loadList">
        <el-option v-for="item in categories" :key="item.id" :label="item.name" :value="item.id" />
      </el-select>
      <el-input v-model="searchTitle" placeholder="搜索标题" style="width: 200px;" clearable @clear="loadList" @keyup.enter="loadList" />
      <el-button type="primary" @click="loadList">搜索</el-button>
    </div>

    <div v-if="list.length > 0" style="display:grid; grid-template-columns: repeat(4, 1fr); gap: 16px; justify-content: start;">
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
        :enable-cover-preview="false"
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
import { fetchVideoReviewList, fetchVideoCategoriesSimpleList, fetchPublicVideosByAuthorId } from '@/api/modules/video'
import type { CategorySimpleVO } from '@/api/types/videoTypes'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(12)

// 搜索条件
const searchCategory = ref<number | string>('')
const searchTitle = ref('')
const categories = ref<CategorySimpleVO[]>([])

const showEdit = ref(true)


// 加载分类
const loadCategories = async () => {
  try {
    const res = await fetchVideoCategoriesSimpleList()
    if (res.code === 200) {
      categories.value = res.data
    }
  } catch (error) {
    console.error('获取分类失败', error)
  }
}

const loadList = async () => {
  loading.value = true
  try {
    const uid = Number(userStore.userInfo?.id)
    if (!Number.isFinite(uid) || uid <= 0) {
      ElMessage.error('未获取到用户信息，请重新登录')
      loading.value = false
      return
    }
    const hasFilter = !!(searchTitle.value || searchCategory.value)
    const res = hasFilter
      ? await fetchVideoReviewList({
          pageNum: pageNum.value,
          pageSize: pageSize.value,
          query: {
            title: searchTitle.value || undefined,
            category: searchCategory.value ? String(searchCategory.value) : undefined,
            authorId: uid
          }
        })
      : await fetchPublicVideosByAuthorId(uid, {
          pageNum: pageNum.value,
          pageSize: pageSize.value,
          sortField: '',
          sortDirection: 'ASC'
        })
    if (res.data) {
      list.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    console.error('获取列表失败', error)
    ElMessage.error('获取视频列表失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCategories()
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
