<template>
  <!-- 医生认证审核列表页，表格与分页风格对齐 DoctorManage.vue -->
  <div class="doctor-auth-page">
    <div class="page-header">
      <h2 class="page-title">医生认证审核</h2>
      <p class="page-desc">
        展示待审核的医生认证申请列表，支持分页与查看详情。
        <span class="stat">共 {{ total }} 条待审核</span>
      </p>
      <div class="header-actions">
        <el-input
          v-model="realName"
          placeholder="真实姓名"
          clearable
          class="w240"
          @input="onFieldInput"
        />
        <el-input
          v-model="qualificationNo"
          placeholder="执业证号"
          clearable
          class="w240"
          @input="onFieldInput"
        />
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
      <el-table-column prop="id" label="申请编号" min-width="160" />
      <el-table-column label="医生" min-width="240">
        <template #default="{ row }">
          <div class="doctor-cell">
            <div class="avatar-circle">{{ getNameInitial(row.realName) }}</div>
            <div class="doctor-meta">
              <div class="doctor-name">{{ row.realName || '-' }}</div>
              <div class="doctor-sub">
                <span class="qual">执业证：{{ row.qualificationNo || '-' }}</span>
                <span class="title">职称：{{ row.title || '-' }}</span>
                <span class="dept">科室ID：{{ row.deptId ?? '-' }}</span>
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

    <!-- 分页：与 DoctorManage.vue 一致 -->
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
// 中文注释：医生认证审核列表页，表格与分页对齐 DoctorManage.vue，包含接口拉取、1秒最少加载、防抖
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchDoctorAuthList } from '@/api/modules/authReview'
import type { DoctorAuthListItem } from '@/api/types/doctorTypes'

const router = useRouter()

/** 列表数据与加载状态 */
const list = ref<DoctorAuthListItem[]>([])
const loading = ref(false)
const total = ref(0)
/** 接口异常标记 */
const fetchError = ref(false)
/** 分页与基础查询参数（BaseQuery） */
const page = ref(1)
const pageSize = ref(10)
const realName = ref('')
const qualificationNo = ref('')
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

const fetchList = async () => {
  if (loading.value) return
  loading.value = true
  fetchError.value = false
  const start = Date.now()
  try {
    // 传递基础查询与分页（接口层为 BasePageQuery）
    const [begin, end] = Array.isArray(dateRange.value) ? dateRange.value : []
    const { data } = await fetchDoctorAuthList({
      pageNum: page.value,
      pageSize: pageSize.value,
      query: {
        realName: realName.value || '',
        qualificationNo: qualificationNo.value || '',
        createdStart: toDate(begin) || '',
        createdEnd: toDate(end) || ''
      }
    })
    const elapsed = Date.now() - start
    if (elapsed < 1000) await sleep(1000 - elapsed)

    const records = (data as any)?.records ?? (data as any)?.list ?? []
    const totalNum = (data as any)?.total ?? (data as any)?.totalCount ?? 0
    list.value = records as DoctorAuthListItem[]
    total.value = Number(totalNum as any) || 0
  } catch (e) {
    console.warn('获取医生认证审核列表失败：', e)
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

/** 工具函数：时间格式化 */
const formatTime = (val: string | number | undefined) => {
  if (!val) return '-'
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(val)) return val
  const d = typeof val === 'number' ? new Date(val) : new Date(String(val))
  if (Number.isNaN(d.getTime())) return String(val)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

/** 将任意可识别时间转换为后端需要的 yyyy-MM-dd（用于 BaseQuery.createdStart/createdEnd） */
const toDate = (val: string | number | Date | undefined) => {
  if (!val) return ''
  if (typeof val === 'string') {
    // 直接裁剪前 10 位可避免浏览器解析差异
    if (val.length >= 10) return val.slice(0, 10)
  }
  const d = typeof val === 'number' ? new Date(val) : new Date(String(val))
  if (Number.isNaN(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 状态文本与标签类型映射 */


/** 取姓名首字用于圆形徽标 */
const getNameInitial = (name: string = '') => {
  if (!name) return '医'
  return name.trim().charAt(0)
}

/** 跳转到详情页 */
const goDetail = (id: string) => {
  // 中文注释：携带列表已有字段，便于详情页在接口缺失时兜底展示
  const row = (list.value || []).find((it: any) => String((it as any).id) === String(id)) as any
  router.push({
    path: `/portal/admin/doctor-cert-review/${id}`,
    query: {
      realName: row?.realName ?? '',
      createdAt: row?.createdAt ?? ''
    }
  })
}

onMounted(fetchList)
</script>

<style scoped>
.doctor-auth-page {
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 6%);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}
.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}
.page-desc {
  margin: 0;
  color: var(--el-text-color-secondary);
}
.page-desc .stat {
  margin-left: 8px;
  color: var(--el-text-color-primary);
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
.w240 { width: 240px; }
.w360 { width: 360px; }
.refresh-btn { flex: 0 0 auto; }

.pager {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.table-empty {
  padding: 24px;
  color: var(--el-text-color-secondary);
  text-align: center;
}

.doctor-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.avatar-circle {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}
.doctor-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.doctor-name {
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.doctor-sub {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  display: flex;
  gap: 12px;
}
</style>
