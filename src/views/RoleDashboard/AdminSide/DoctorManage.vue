<template>
  <!-- 医生管理列表页（中文注释） -->
  <div class="doctor-page">
    <!-- 查询卡片：所有筛选条件和操作按钮都包含在一个支持响应式换行的表单中 -->
    <el-card class="query-card" shadow="never">
      <!-- 未展开时增加 is-compact 类，强制一行展示，按钮固定在最右 -->
      <el-form @submit.prevent :class="['query-form', { 'is-compact': !advancedOpen }]">
        <!-- 基础筛选 -->
        <el-form-item label="关键词">
          <el-input
            v-model="query.keyword"
            placeholder="按姓名/工号搜索"
            clearable
            class="form-input"
            @keyup.enter="onConfirm"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="科室">
          <el-select v-model="query.department" placeholder="全部科室" clearable class="form-select">
            <el-option v-for="d in deptOptions" :key="d" :label="d" :value="d" />
          </el-select>
        </el-form-item>
        <el-form-item label="职称">
          <el-select v-model="query.title" placeholder="全部职称" clearable class="form-select">
            <el-option v-for="t in titleOptions" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部状态" clearable class="form-select">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>

        <!-- 高级筛选：通过 v-if 控制显隐，实现动态布局 -->
        <template v-if="advancedOpen">
          <el-form-item label="创建时间">
            <el-date-picker
              v-model="query.createdRange"
              type="daterange"
              range-separator="至"
              start-placeholder="创建起始"
              end-placeholder="创建结束"
              value-format="YYYY-MM-DD"
              class="form-select"
            />
          </el-form-item>
          <el-form-item label="性别">
            <el-select v-model="query.gender" placeholder="全部性别" clearable class="form-select">
              <el-option label="男" value="M" />
              <el-option label="女" value="F" />
            </el-select>
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
      <el-table-column prop="jobNo" label="工号" min-width="120" />
      <el-table-column prop="name" label="姓名" min-width="140" />
      <el-table-column prop="department" label="科室" min-width="160" />
      <el-table-column prop="title" label="职称" min-width="140" />
      <el-table-column prop="phone" label="手机号" min-width="150" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'info'">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" min-width="180">
        <template #default="{ row }">
          {{ formatTime(row.createdAt) }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页：居中、中文 -->
    <div class="pager">
      <el-pagination
        background
        layout="total, prev, pager, next"
        :total="total"
        :current-page="query.page"
        :page-size="query.pageSize"
        @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// 页面逻辑（中文注释）
import { ref, onMounted } from 'vue'
import { Search, ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { doctorApi } from '@/api'
import type { DoctorItem } from '@/api/types/doctorTypes'

/** 是否使用模拟数据（后端接好接口后置为 false） */
const useMock = true

/** 展开高级筛选开关 */
const advancedOpen = ref(false)

/** 列表数据与加载状态 */
const list = ref<DoctorItem[]>([])
const loading = ref(false)
const total = ref(0)

/** 查询参数（分页+筛选） */
const query = ref<{
  page: number
  pageSize: number
  keyword?: string
  department?: string
  title?: string
  status?: 0 | 1 | undefined
  gender?: string
  createdRange?: string[] | []
}>({
  page: 1,
  pageSize: 10,
  keyword: '',
  department: '',
  title: '',
  status: undefined,
  gender: '',
  createdRange: []
})

/** 选项：科室、职称 */
const deptOptions = ['内科', '外科', '儿科', '骨科', '急诊科', '口腔科']
const titleOptions = ['主任医师', '副主任医师', '主治医师', '住院医师']

/** 生成10条模拟数据 */
const buildMock = (): { list: DoctorItem[]; total: number } => {
  const base: DoctorItem[] = Array.from({ length: 10 }).map((_, i) => {
    const id = i + 1
    const dept = deptOptions[i % deptOptions.length]
    const title = titleOptions[i % titleOptions.length]
    return {
      id,
      jobNo: 'D' + String(1000 + id),
      name: '医生' + id,
      department: dept,
      title,
      phone: '1380000' + String(1000 + id),
      status: i % 2 === 0 ? 1 : 0,
      createdAt: Date.now() - i * 86400000
    }
  })
  return { list: base, total: base.length }
}

/** 获取列表（支持后端/模拟两种模式） */
const fetchList = async () => {
  loading.value = true
  try {
    if (useMock) {
      const { list: all } = buildMock()
      // 本地筛选（示例）
      const filtered = all.filter(item => {
        const kw = (query.value.keyword || '').trim()
        const hitKw = kw ? (item.name?.includes(kw) || item.jobNo?.includes(kw)) : true
        const hitDept = query.value.department ? item.department === query.value.department : true
        const hitTitle = query.value.title ? item.title === query.value.title : true
        const hitStatus = query.value.status === 0 || query.value.status === 1 ? item.status === query.value.status : true
        return hitKw && hitDept && hitTitle && hitStatus
      })
      total.value = filtered.length
      const start = (query.value.page - 1) * query.value.pageSize
      const end = start + query.value.pageSize
      list.value = filtered.slice(start, end)
      return
    }
    // 后端模式
    const res = await doctorApi.getDoctorList(query.value as any)
    const data = (res as any)?.data?.list ? (res as any).data : (res as any)
    list.value = data.list || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

/** 分页变化 */
const onPageChange = (p: number) => {
  query.value.page = p
  fetchList()
}

/** 重置与确定 */
const onReset = () => {
  query.value = {
    page: 1, pageSize: 10,
    keyword: '', department: '', title: '', status: undefined,
    gender: '', createdRange: []
  }
  fetchList()
}
const onConfirm = () => {
  query.value.page = 1
  fetchList()
}

/** 时间格式化（简单处理） */
const formatTime = (val: string | number | undefined) => {
  if (!val) return '-'
  const d = typeof val === 'number' ? new Date(val) : new Date(String(val))
  if (Number.isNaN(d.getTime())) return String(val)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
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
  padding-top: 12px;
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

</style>