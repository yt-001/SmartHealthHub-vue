![1764591274541](image/VideoList/1764591274541.png)![1764591278081](image/VideoList/1764591278081.png)<template>
  <div class="video-list-page">
    <div class="page-header">
      <h3 class="page-title">视频列表</h3>
      <div class="header-actions">
        <el-button @click="onRefresh">刷新</el-button>
      </div>
    </div>

    <el-form :inline="true" class="query-form">
      <el-form-item label="标题">
        <el-input v-model="title" placeholder="按标题搜索" class="w240" @input="onFieldInput" />
      </el-form-item>
      <el-form-item label="作者">
        <el-input v-model="uploader" placeholder="按作者搜索" class="w240" @input="onFieldInput" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="status" clearable placeholder="全部" class="w160" @change="onFieldInput">
          <el-option :value="0" label="草稿" />
          <el-option :value="1" label="已发布" />
          <el-option :value="2" label="已下架" />
          <el-option :value="3" label="审核中" />
          <el-option :value="4" label="未通过" />
        </el-select>
      </el-form-item>
      <el-form-item label="时间">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" @change="onDateChange" />
      </el-form-item>
      <el-form-item class="form-actions">
        <el-button type="primary" @click="fetchList">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="list" v-loading="loading">
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column label="视频" min-width="360">
        <template #default="{ row }">
          <div class="video-cell">
            <div class="thumb"><img v-if="row.coverImageUrl" :src="row.coverImageUrl" alt="封面" /></div>
            <div class="video-meta">
              <div class="video-title">{{ row.title || '-' }}</div>
              <div class="video-sub">
                <span>作者：{{ row.authorName || '-' }}</span>
                <div class="category-tags">
                  <template v-if="Array.isArray((row as any).categories) && (row as any).categories.length">
                    <el-tag v-for="(c, idx) in (row as any).categories.slice(0, 2)" :key="c.id" size="small" type="info">{{ c.name }}</el-tag>
                    <el-tag v-if="(row as any).categories.length > 2" size="small" class="more-tag" @click="onShowAllCategories((row as any).categories)">+</el-tag>
                  </template>
                  <span v-else>-</span>
                </div>
                <span>时长：{{ row.duration ?? '-' }}秒</span>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="120">
        <template #default="{ row }">
          {{ formatStatus(row.status) }}
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" min-width="180">
        <template #default="{ row }">
          {{ row.createdAt || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="goDetail(row.id)">查看</el-button>
          <el-button link type="primary" @click="goEdit(row.id)">编辑</el-button>
        </template>
      </el-table-column>
      <template #empty>
        <div v-if="!loading" class="table-empty">{{ fetchError ? '数据异常，请稍后重试' : '暂无数据' }}</div>
      </template>
    </el-table>

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
    <el-dialog v-model="categoryDialogVisible" title="分类标签" width="480px">
      <div class="all-category-tags">
        <el-tag v-for="c in categoryDialogItems" :key="c.id" size="small" type="info">{{ c.name }}</el-tag>
      </div>
      <template #footer>
        <el-button @click="categoryDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { HealthVideoReviewVO } from '@/api/types/videoTypes'
import { fetchVideoReviewList } from '@/api/modules/video'

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
const status = ref<number | null>(null)
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

/** 状态格式化 */
function formatStatus(s: number | undefined) {
  const map: Record<number, string> = { 0: '草稿', 1: '已发布', 2: '已下架', 3: '审核中', 4: '未通过' }
  return s != null ? (map[s] || String(s)) : '-'
}
/**
 * 格式化分类列表为中文顿号分隔的名称串
 * @param items 分类数组
 */
function formatCategories(items?: { id: number; name: string }[]) {
  if (!items || !items.length) return '-'
  return items.map(i => i.name).join('、')
}

/** 构造查询入参 */
function buildPayload() {
  const [begin, end] = Array.isArray(dateRange.value) ? dateRange.value : []
  return {
    pageNum: page.value,
    pageSize: pageSize.value,
    sortField: '',
    sortDirection: 'ASC' as const,
    query: {
      title: title.value || '',
      authorName: uploader.value || '',
      status: typeof status.value === 'number' ? status.value : null,
      createdStart: begin || '',
      createdEnd: end || ''
    }
  }
}

/** 拉取视频列表（分页） */
const fetchList = async () => {
  if (loading.value) return
  loading.value = true
  fetchError.value = false
  const start = Date.now()
  try {
    const resp = await fetchVideoReviewList(buildPayload() as any)
    const elapsed = Date.now() - start
    if (elapsed < 1000) await sleep(1000 - elapsed)
    const data: any = resp?.data || {}
    const records = data?.records ?? data?.list ?? []
    const totalNum = data?.total ?? data?.totalCount ?? 0
    list.value = records as HealthVideoReviewVO[]
    total.value = Number(totalNum as any) || 0
  } catch (e) {
    console.warn('获取视频列表失败：', e)
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
const onPageChange = (p: number) => { page.value = p; fetchListDebounced() }
const onPageSizeChange = (size: number) => { pageSize.value = size; page.value = 1; fetchListDebounced() }

/** 刷新按钮：立即请求 */
const onRefresh = () => { fetchList() }
/** 任一查询字段输入（防抖） */
const onFieldInput = () => { page.value = 1; fetchListDebounced() }
/** 时间范围变化（防抖） */
const onDateChange = () => { page.value = 1; fetchListDebounced() }

/**
 * 打开分类标签弹窗
 * @param items 分类数组
 */
const categoryDialogVisible = ref(false)
const categoryDialogItems = ref<{ id: number; name: string }[]>([])
const onShowAllCategories = (items: { id: number; name: string }[]) => {
  categoryDialogItems.value = Array.isArray(items) ? items : []
  categoryDialogVisible.value = true
}

/**
 * 重置查询条件
 * 清空所有查询字段并重置到第一页后重新拉取列表
 */
const resetQuery = () => {
  title.value = ''
  uploader.value = ''
  status.value = null
  dateRange.value = []
  page.value = 1
  fetchList()
}

/**
 * 跳转视频详情
 * @param id 视频ID
 */
const router = useRouter()
/**
 * 查看视频：进入管理员编辑页的只读模式
 * @param id 视频ID
 */
const goDetail = (id: number | string) => { router.push({ path: '/portal/admin/video-edit', query: { id, mode: 'view' } }) }
/**
 * 跳转管理员编辑视频
 * @param id 视频ID
 */
const goEdit = (id: number | string) => { router.push({ path: '/portal/admin/video-edit', query: { id, mode: 'edit' } }) }

onMounted(fetchList)
</script>

<style scoped>
.video-list-page { padding: 16px; }
.page-header { margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; }
.page-title { font-size: 18px; margin: 0; }
.header-actions { display: flex; gap: 10px; }
.query-form { display: flex; align-items: flex-end; flex-wrap: wrap; gap: 12px; margin-bottom: 12px; }
.w240 { width: 240px; }
.w160 { width: 160px; }
.form-actions { margin-left: auto; }
.table-empty { padding: 24px; color: #909399; text-align: center; }
.pager { margin-top: 12px; display: flex; justify-content: center; }
.video-cell { display: flex; align-items: center; gap: 10px; }
.thumb { width: 80px; height: 60px; background: #f0f2f5; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden; }
.thumb img { width: 100%; height: 100%; object-fit: cover; }
.video-meta { display: flex; flex-direction: column; gap: 4px; }
.video-title { font-weight: 600; color: #333; }
.video-sub { color: #666; display: flex; gap: 8px; }
.category-tags { display: flex; align-items: center; gap: 6px; }
.category-tags .el-tag { margin-right: 0; }
.more-tag { cursor: pointer; }
.all-category-tags { display: flex; flex-wrap: wrap; gap: 6px; }
</style>
