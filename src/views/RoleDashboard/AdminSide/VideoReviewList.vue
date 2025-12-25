<template>
  <!-- 审核视频列表页：沿用 DoctorCertReviewList 的布局与交互（中文注释） -->
  <div class="video-review-page">
    <div class="page-header">
      <h2 class="page-title">审核视频</h2>
      <p class="page-desc">
        展示待审核的视频列表，支持分页与查看详情。
        <span class="stat">共 {{ total }} 条待审核</span>
      </p>
      <div class="header-actions">
        <!-- 标题筛选 -->
        <el-input
          v-model="title"
          placeholder="视频标题"
          clearable
          class="w240"
          @input="onFieldInput"
        />
        <!-- 上传者筛选 -->
        <el-input
          v-model="uploader"
          placeholder="上传者"
          clearable
          class="w240"
          @input="onFieldInput"
        />
        <!-- 时间范围筛选 -->
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          class="w360"
          @change="onDateChange"
        />
        <el-button class="refresh-btn" type="primary" @click="onRefresh">刷新</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table
      :data="list"
      border
      stripe
      v-loading="loading"
      element-loading-text="加载中..."
    >
      <el-table-column prop="id" label="视频编号" min-width="160" />
      <el-table-column label="视频信息" min-width="320">
        <template #default="{ row }">
          <div class="video-cell">
            <div class="thumb" :style="{ backgroundImage: row.coverImageUrl ? `url(${row.coverImageUrl})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }" />
            <div class="video-meta">
              <div class="video-title">
                {{ row.title || '-' }}
                <!-- 状态标签：仅显示 3/4 两种状态 -->
                <el-tag v-if="(row as any).status === 3" type="warning" size="small" style="margin-left:8px;">审核中</el-tag>
                <el-tag v-else-if="(row as any).status === 4" type="danger" size="small" style="margin-left:8px;">未通过审核</el-tag>
              </div>
              <div class="video-sub">
                <span class="uploader">上传者：{{ (row as any).authorName || '-' }}</span>
                <span class="duration">时长：{{ formatDuration((row as any).duration) }}</span>
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
        <div v-if="!loading" class="table-empty">
          {{ fetchError ? '数据异常，请稍后重试' : '暂无数据' }}
        </div>
      </template>
    </el-table>

    <!-- 分页：与 DoctorCertReviewList.vue 一致 -->
    <div class="pager">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :current-page="page"
        :page-size="pageSize"
        :page-sizes="[10, 20, 30, 50]"
        @current-change="onPageChange"
        @size-change="onPageSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// 中文注释：审核视频列表页，对接后端接口；POST 传分页与查询对象
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchVideoReviewList } from '@/api/modules/video'
import type { HealthVideoReviewVO } from '@/api/types/videoTypes'

const router = useRouter()

/** 列表数据与加载状态 */
const list = ref<HealthVideoReviewVO[]>([])
const loading = ref(false)
const total = ref(0)
/** 接口异常标记 */
const fetchError = ref(false)
/** 分页与基础查询参数（BaseQuery） */
const page = ref(1)
const pageSize = ref(10)
const title = ref('')
const uploader = ref('')
const dateRange = ref<[string, string] | []>([])

/** 简单延迟（保证最少加载 1 秒） */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/** 防抖封装 */
function useDebounce<T extends (...args: any[]) => any>(fn: T, delay = 300) {
  let timer: number | undefined
  return (...args: Parameters<T>) => {
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), delay)
  }
}

/** 时间字符串归一化（YYYY-MM-DD HH:mm:ss） */
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

/** 仅展示用途的时间格式化 */
const formatTime = (v?: string | number | Date) => v ? toDate(v) : '-'

/** 将秒数格式化为 mm:ss 或 hh:mm:ss */
const formatDuration = (sec?: number | null) => {
  if (!sec && sec !== 0) return '-'
  const s = Number(sec)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const ss = s % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(ss)}` : `${pad(m)}:${pad(ss)}`
}

const fetchList = async () => {
  if (loading.value) return
  loading.value = true
  fetchError.value = false
  const start = Date.now()
  try {
    // 传递基础查询与分页（接口层为 BasePageQuery）
    const [begin, end] = Array.isArray(dateRange.value) ? dateRange.value : []
    const resp = await fetchVideoReviewList({
      pageNum: page.value,
      pageSize: pageSize.value,
      sortField: '',
      sortDirection: 'ASC',
      query: {
        title: title.value || '',
        authorName: uploader.value || '',
        deptId: undefined,
        category: '',
        isTop: undefined,
        status: undefined,
        statusList: [3, 4],
        createdStart: toDate(begin) || '',
        createdEnd: toDate(end) || ''
      }
    })

    const elapsed = Date.now() - start
    if (elapsed < 1000) await sleep(1000 - elapsed)

    // 兼容后端返回体：支持 list/records 与 total/totalCount
    const data: any = resp?.data || {}
    const records = data?.records ?? data?.list ?? []
    const totalNum = data?.total ?? data?.totalCount ?? 0
    list.value = records as HealthVideoReviewVO[]
    total.value = Number(totalNum as any) || 0
  } catch (e) {
    console.warn('获取审核视频列表失败：', e)
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

/** 分页变化（防抖） */
const onPageChange = (p: number) => {
  page.value = p
  fetchListDebounced()
}
const onPageSizeChange = (size: number) => {
  pageSize.value = size
  page.value = 1
  fetchListDebounced()
}

/** 刷新按钮：立即请求（不防抖） */
const onRefresh = () => {
  fetchList()
}

/** 任一查询字段输入（防抖） */
const onFieldInput = () => {
  page.value = 1
  fetchListDebounced()
}

/** 时间范围变化（防抖） */
const onDateChange = () => {
  page.value = 1
  fetchListDebounced()
}



/** 跳转详情页（预留，占位） */
const goDetail = (id: number | string) => {
  router.push({ name: 'AdminVideoReviewDetail', params: { id } })
}

onMounted(fetchList)
</script>

<style scoped>
.video-review-page { padding: 16px; }
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

.video-cell { display: flex; align-items: center; gap: 10px; }
.thumb { width: 80px; height: 60px; background: #f0f2f5; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
.video-meta { display: flex; flex-direction: column; gap: 4px; }
.video-title { font-weight: 600; color: #333; }
.video-sub { color: #666; display: flex; gap: 8px; }
</style>
