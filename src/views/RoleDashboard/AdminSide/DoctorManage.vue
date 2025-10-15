<template>
  <!-- 医生管理列表页（中文注释） -->
  <div class="doctor-page">
    <!-- 查询卡片：所有筛选条件和操作按钮都包含在一个支持响应式换行的表单中 -->
    <el-card class="query-card" shadow="never">
      <!-- 未展开时增加 is-compact 类，强制一行展示，按钮固定在最右 -->
      <el-form @submit.prevent :class="['query-form', { 'is-compact': !advancedOpen }]">
        <!-- 基础筛选 -->
        <el-form-item label="姓名">
          <el-input
            v-model="query.realName"
            placeholder="按姓名搜索"
            clearable
            class="form-input"
            @keyup.enter="onConfirm"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input
            v-model="query.phone"
            placeholder="按手机号搜索"
            clearable
            class="form-input"
            @keyup.enter="onConfirm"
          />
        </el-form-item>
        <el-form-item label="科室">
          <el-select v-model="query.deptId" placeholder="全部科室" clearable class="form-select">
            <el-option v-for="d in deptOptions" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="职称">
          <el-select v-model="query.title" placeholder="全部职称" clearable class="form-select">
            <el-option v-for="t in titleOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部状态" clearable class="form-select">
            <el-option label="正常" :value="0" />
            <el-option label="锁定" :value="1" />
            <el-option label="未激活" :value="2" />
            <el-option label="已注销" :value="3" />
          </el-select>
        </el-form-item>

        <!-- 高级筛选：通过 v-if 控制显隐，实现动态布局 -->
        <template v-if="advancedOpen">
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="query.createdRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              value-format="YYYY-MM-DD"
              class="form-select"
            />
          </el-form-item>

        </template>

        <!-- 操作按钮：作为表单的最后一个 flex 项，靠右对齐 -->
        <el-form-item class="form-actions">
          <el-button @click="onReset">重置</el-button>
          <el-button type="primary" @click="onConfirm">确定</el-button>
          <el-button link type="primary" @click="advancedOpen = !advancedOpen">
            <span>{{ advancedOpen ? '收起' : '展开' }}</span>
            <el-icon class="toggle-icon">
              <component :is="advancedOpen ? ArrowUp : ArrowDown" />
            </el-icon>
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格（滚动由外层内容区负责，不在本页内部限制高度） -->
    <el-table
      :data="list"
      border
      stripe
      v-loading="loading"
      element-loading-text="加载中..."
    >
      <el-table-column prop="id" label="ID" width="80" />
      <!-- 自定义“医生”列：左侧圆圈显示姓名，右侧上下为邮箱/电话 -->
      <el-table-column label="医生" min-width="280">
        <template #default="{ row }">
          <div class="doctor-cell">
            <div class="avatar-circle">{{ getNameInitial(row.realName) }}</div>
            <div class="doctor-meta">
              <div class="doctor-name">{{ row.realName || '-' }}</div>
              <div class="doctor-sub">
                <span class="email">{{ row.email || '-' }}</span>
              </div>
            </div>
          </div>
        </template>
      </el-table-column>

      <!-- 新增：手机号单独成列 -->
      <el-table-column prop="phone" label="手机号" min-width="150" />

      <!-- 新增：擅长领域 -->
      <el-table-column prop="specialty" label="擅长领域" min-width="180" show-overflow-tooltip />

      <!-- 新增：执业证书编号 -->
      <el-table-column prop="qualificationNo" label="执业证书编号" min-width="200" show-overflow-tooltip />

      <el-table-column prop="title" label="职称" min-width="140" />
      <el-table-column prop="deptId" label="科室ID" min-width="120" />
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusInfo(row.status).type">
            {{ statusInfo(row.status).text }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" min-width="180">
        <template #default="{ row }">
          {{ formatTime(row.createdAt) }}
        </template>
      </el-table-column>

      <!-- 空数据插槽：区分异常与正常无数据 -->
      <template #empty>
        <div class="table-empty">
          {{ fetchError ? '数据异常，请稍后重试' : '暂无数据' }}
        </div>
      </template>
    </el-table>

    <!-- 分页：居中、中文 -->
    <div class="pager">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        :current-page="query.page"
        :page-size="query.pageSize"
        :page-sizes="[10, 20, 30, 50]"
        @current-change="onPageChange"
        @size-change="onPageSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// 页面逻辑（中文注释）
import { ref, onMounted } from 'vue'
import { Search, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { doctorApi } from '@/api'
import type { DoctorItem, DoctorListParams } from '@/api/types/doctorTypes'

/** 禁止模拟数据：所有数据都来自后端 */
const useMock = false

/** 展开高级筛选开关 */
const advancedOpen = ref(false)

/** 列表数据与加载状态 */
const list = ref<DoctorItem[]>([])
const loading = ref(false)
const total = ref(0)
/** 标记是否发生接口异常，用于表格内展示“数据异常” */
const fetchError = ref(false)

/** 查询参数（分页+筛选） */
const query = ref<DoctorListParams & { createdRange?: [string, string] | [] }>({
  page: 1,
  pageSize: 10,
  realName: '',
  phone: '',
  deptId: undefined,
  title: '',
  status: undefined,
  createTime: undefined,
  createdRange: []
})

/** 选项：科室、职称 */
const deptOptions = [
  { label: '内科', value: 1 },
  { label: '外科', value: 2 },
  { label: '儿科', value: 3 },
  { label: '骨科', value: 4 },
  { label: '急诊科', value: 5 },
  { label: '口腔科', value: 6 }
]
const titleOptions = ['主任医师', '副主任医师', '主治医师', '住院医师']

/* 已禁用模拟数据 */

/** 简单延迟（用于保证最少加载时长） */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/** 获取列表（仅后端模式，直接使用已定义的查询参数类型） */
const buildDoctorPayload = (q: DoctorListParams & { createdRange?: [string, string] | [] }) => {
  // 将筛选条件嵌入 query；时间范围映射为 createTimeStart/createTimeEnd
  const [createTimeStart, createTimeEnd] =
    (Array.isArray(q.createdRange) ? q.createdRange : []) as [string?, string?]
  return {
    pageNum: q.page,
    pageSize: q.pageSize,
    sortField: '',
    sortDirection: 'ASC',
    query: {
      // BaseQuery
      keyword: '', // 关键词改用姓名搜索，这里置空
      createTime: q.createTime ?? '',
      updateTime: q.updateTime ?? '',
      // 衍生的范围字段（若后端已支持范围，将其作为主要条件）
      createTimeStart: createTimeStart ?? '',
      createTimeEnd: createTimeEnd ?? '',
      // DoctorPageQuery
      username: q.username ?? '',
      realName: q.realName ?? '',
      phone: q.phone ?? '',
      email: q.email ?? '',
      title: q.title ?? '',
      deptId: typeof q.deptId === 'number' ? q.deptId : null,
      specialty: q.specialty ?? '',
      status: typeof q.status === 'number' ? q.status : null
    }
  }
}

const fetchList = async () => {
  loading.value = true
  fetchError.value = false
  const start = Date.now()
  try {

    const payload = buildDoctorPayload(query.value)

    const res = await doctorApi.getDoctorList(payload)
    const data = (res as any)?.data?.list ? (res as any).data : (res as any)

    list.value = (data.list || []) as DoctorItem[]
    total.value = data.total || 0
  } catch (e) {
    console.warn('获取医生列表失败：', e)
    fetchError.value = true
    list.value = []
    total.value = 0
  } finally {
    // 保证最少 0.8s 的加载体验
    const elapsed = Date.now() - start
    if (elapsed < 800) await sleep(800 - elapsed)
    loading.value = false
  }
}

/** 防抖封装：避免快速点击触发多次查询 */
function useDebounce<T extends (...args: any[]) => any>(fn: T, delay = 300) {
  let timer: number | undefined
  return (...args: Parameters<T>) => {
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), delay)
  }
}
const fetchListDebounced = useDebounce(fetchList, 300)

/** 分页变化 */
const onPageChange = (p: number) => {
  // 当前页变更（防抖触发查询）
  query.value.page = p
  fetchListDebounced()
}
const onPageSizeChange = (size: number) => {
  // 每页条数变更后回到第 1 页（防抖触发查询）
  query.value.pageSize = size
  query.value.page = 1
  fetchListDebounced()
}

/** 重置与确定 */
const onReset = () => {
  // 重置查询后立即请求
  query.value = {
    page: 1,
    pageSize: 10,
    realName: '',
    phone: '',
    deptId: undefined,
    title: '',
    status: undefined,
    createTime: undefined,
    createdRange: []
  } as any
  fetchList()
}
const onConfirm = () => {
  // 点击确定：页码回到 1（防抖触发查询）
  query.value.page = 1
  fetchListDebounced()
}

/** 时间格式化（后端返回 yyyy-MM-dd HH:mm:ss 也兼容） */
const formatTime = (val: string | number | undefined) => {
  if (!val) return '-'
  // 若是 "2023-03-01 00:00:00" 直接返回或可替换空格为 T 再格式化
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

/** 状态文本与标签样式映射（0 正常） */
const statusInfo = (s: number) => {
  switch (s) {
    case 0: return { text: '正常', type: 'success' as const }
    case 1: return { text: '锁定', type: 'warning' as const }
    case 2: return { text: '未激活', type: 'info' as const }
    case 3: return { text: '已注销', type: 'default' as const }
    default: return { text: String(s), type: 'info' as const }
  }
}

/** 取姓名首字（中文首字或英文字母），用于圆形徽标 */
const getNameInitial = (name: string = '') => {
  if (!name) return '医'
  return name.trim().charAt(0)
}

onMounted(fetchList)
</script>

<style scoped>
.doctor-page {
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

/* 查询卡片 */
.query-card {
  margin-bottom: 12px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}
.query-card :deep(.el-card__body) {
  padding: 12px;
}

/* 将所有筛选和操作项统一放入一个 flex 容器中，实现响应式换行 */
.query-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
}

/* 统一设置每个表单项的 flex 属性，使其能够自适应换行 */
.query-form :deep(.el-form-item) {
  /* 每个筛选项占固定基础宽度，允许在一行放不下时自动换行 */
  flex: 0 1 260px; /* 不再主动扩展，避免把操作区挤到中间 */
  min-width: 220px; /* 适度降低最小宽度提升适配性 */
  margin: 0 !important; /* 覆盖 el-form-item 的默认 margin */
}

/* 操作按钮区域的特殊处理 */
.query-form :deep(.form-actions) {
  /* 操作区始终靠右：使用 margin-left:auto 将其推到当前行的最右侧 */
  display: flex;
  gap: 10px;
  margin-left: auto; /* 关键：将按钮组推到右侧 */
  flex: 0 0 auto; /* 不参与扩展，避免换行时占满整行 */
  min-width: fit-content; /* 确保按钮组不会被过度压缩 */
  justify-content: flex-end; /* 按钮视觉靠右 */
}

.toggle-icon {
  margin-left: 4px;
}

/* 控件统一高度与宽度 */
.form-input,
.form-select {
  width: 100%;
}
:deep(.form-input .el-input__wrapper),
:deep(.form-select .el-select__wrapper),
:deep(.el-range-editor.el-input__wrapper) {
  height: 40px;
}

/* 分页居中（滚动交由外层内容区控制） */
.pager {
  display: flex;
  justify-content: center;
  padding-top: 0;      /* 去掉与表格的垂直空隙 */
  margin-top: 10px;    /* 轻微上移与表格边框贴合 */
}
/* 紧凑模式：未展开（仅基础筛选）时，强制单行展示，按钮固定在最右侧 */
.query-form.is-compact {
  flex-wrap: nowrap; /* 关键：不换行 */
}

/* 紧凑模式下，普通筛选项允许收缩以挤在同一行 */
.query-form.is-compact :deep(.el-form-item) {
  flex: 1 1 0; /* 允许收缩到更小宽度 */
  min-width: 0; /* 放宽最小宽度限制，避免被迫换行 */
}

/* 紧凑模式下，操作按钮区保持不收缩并靠右 */
.query-form.is-compact :deep(.form-actions) {
  margin-left: auto; /* 推到最右 */
  flex: 0 0 auto;    /* 不参与收缩扩展 */
}

/* 自定义医生单元格样式（中文注释） */
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