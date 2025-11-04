<template>
  <!-- 审核文章列表页：布局与交互对齐“审核视频” -->
  <div class="article-review-page">
    <div class="page-header">
      <h2 class="page-title">审核文章</h2>
      <p class="page-desc">
        展示待审核的文章列表，支持分页与查看详情。
        <span class="stat">共 {{ total }} 条待审核</span>
      </p>
      <div class="header-actions">
        <el-input v-model="title" placeholder="文章标题" clearable class="w240" @input="onFieldInput" />
        <el-input v-model="uploader" placeholder="作者姓名" clearable class="w240" @input="onFieldInput" />
        <el-date-picker v-model="dateRange" type="datetimerange" range-separator="至" start-placeholder="开始时间" end-placeholder="结束时间" value-format="YYYY-MM-DD HH:mm:ss" class="w360" @change="onDateChange" />
        <el-button class="refresh-btn" type="primary" @click="onRefresh">刷新</el-button>
      </div>
    </div>

    <el-table :data="list" border stripe v-loading="loading" element-loading-text="加载中...">
      <el-table-column prop="id" label="文章编号" min-width="160" />
      <el-table-column label="文章信息" min-width="420">
        <template #default="{ row }">
          <div class="article-cell">
            <div class="article-meta">
              <div class="article-title">
                {{ row.title || '-' }}
                <el-tag v-if="(row as any).status === 3" type="warning" size="small" style="margin-left:8px;">审核中</el-tag>
                <el-tag v-else-if="(row as any).status === 4" type="danger" size="small" style="margin-left:8px;">未通过审核</el-tag>
              </div>
              <div class="article-sub">
                <span class="uploader">作者：{{ (row as any).authorName || '-' }}</span>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="提交时间" min-width="180">
        <template #default="{ row }">
          {{ formatTime(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goDetail(row.id)">查看</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <div v-if="!loading" class="table-empty">{{ fetchError ? '数据异常，请稍后重试' : '暂无数据' }}</div>
      </template>
    </el-table>

    <div class="pager">
      <el-pagination background layout="total, sizes, prev, pager, next, jumper" :total="total" :current-page="page" :page-size="pageSize" :page-sizes="[10, 20, 30, 50]" @current-change="onPageChange" @size-change="onPageSizeChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
// 中文注释：审核文章列表页，对接后端接口；POST 传分页与查询对象
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchArticleReviewList } from '@/api/modules/article'
import type { HealthArticleReviewVO } from '@/api/types/articleTypes'

const router = useRouter()

// 列表数据与加载状态
const list = ref<HealthArticleReviewVO[]>([])
const loading = ref(false)
const total = ref(0)
const fetchError = ref(false)

// 分页与基础查询参数
const page = ref(1)
const pageSize = ref(10)
const title = ref('')
const uploader = ref('')
const dateRange = ref<[string, string] | []>([])

// 简单延时（保证最少加载 1 秒）
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 防抖封装
function useDebounce<T extends (...args: any[]) => any>(fn: T, delay = 300) {
  let timer: number | undefined
  return (...args: Parameters<T>) => {
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), delay)
  }
}

// 时间字符串归一化（YYYY-MM-DD HH:mm:ss）
const toDate = (v?: string | number | Date | null): string => {
  if (!v) return ''
  const d = new Date(v)
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const MM = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const HH = pad(d.getHours())
  const mm = pad(d.getMinutes())
  const ss = pad(d.getSeconds())
  return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`
}

// 仅展示用途的时间格式化
const formatTime = (v?: string | number | Date) => v ? toDate(v) : '-'

const fetchList = async () => {
  if (loading.value) return
  loading.value = true
  fetchError.value = false
  const start = Date.now()
  try {
    const [begin, end] = Array.isArray(dateRange.value) ? dateRange.value : []
    const resp = await fetchArticleReviewList({
      pageNum: page.value,
      pageSize: pageSize.value,
      sortField: '',
      sortDirection: 'ASC',
      query: {
        title: title.value || '',
        authorName: uploader.value || '',
        deptId: null,
        category: '',
        status: null,
        statusList: [3, 4],
        createdStart: toDate(begin) || '',
        createdEnd: toDate(end) || ''
      }
    })

    const elapsed = Date.now() - start
    if (elapsed < 1000) await sleep(1000 - elapsed)

    const data: any = resp?.data || {}
    const records = data?.records ?? data?.list ?? []
    const totalNum = data?.total ?? data?.totalCount ?? 0
    list.value = records as HealthArticleReviewVO[]
    total.value = totalNum
  } catch (e) {
    console.warn('获取审核文章列表失败：', e)
    fetchError.value = true
    list.value = []
    total.value = 0
    const elapsed = Date.now() - start
    if (elapsed < 1000) await sleep(1000 - elapsed)
  } finally {
    loading.value = false
  }
}
const fetchListDebounced = useDebounce(fetchList, 300)

// 分页变化（防抖）
const onPageChange = (p: number) => { page.value = p; fetchListDebounced() }
const onPageSizeChange = (size: number) => { pageSize.value = size; page.value = 1; fetchListDebounced() }

// 刷新按钮：立即请求（不防抖）
const onRefresh = () => { fetchList() }

// 任一查询字段输入（防抖）
const onFieldInput = () => { page.value = 1; fetchListDebounced() }

// 时间范围变化（防抖）
const onDateChange = () => { page.value = 1; fetchListDebounced() }

// 跳转详情页
const goDetail = (id: number | string) => { router.push({ name: 'AdminArticleReviewDetail', params: { id } }) }

onMounted(fetchList)
</script>

<style scoped>
.article-review-page { padding: 16px; }
.page-header { margin-bottom: 12px; }
.page-title { font-size: 18px; margin: 0; }
.page-desc { color: #666; margin-top: 6px; }
.page-desc .stat { margin-left: 8px; color: #333; }
.header-actions { display: flex; gap: 10px; margin-top: 12px; align-items: center; }
.w240 { width: 240px; }
.w360 { width: 360px; }
.refresh-btn { margin-left: auto; }
.table-empty { padding: 24px; color: #909399; text-align: center; }
.pager { margin-top: 12px; display: flex; justify-content: center; }

.article-cell { display: flex; align-items: center; gap: 10px; }
.thumb { width: 80px; height: 60px; background: #f0f2f5; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
.article-meta { display: flex; flex-direction: column; gap: 4px; }
.article-title { font-weight: 600; color: #333; }
.article-sub { color: #666; display: flex; gap: 8px; }
</style>
