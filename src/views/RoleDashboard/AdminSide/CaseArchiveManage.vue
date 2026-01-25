<template>
  <!-- 病例档案管理列表页（中文注释） -->
  <div class="case-archive-page">
    <!-- 查询卡片：与其他管理页保持一致布局 -->
    <el-card class="query-card" shadow="never">
      <el-form @submit.prevent :class="['query-form', { 'is-compact': !advancedOpen }]">
        <!-- 基础筛选（对齐后端查询字段） -->
        <el-form-item label="患者姓名">
          <el-input
            v-model="query.patientName"
            placeholder="按患者姓名搜索"
            clearable
            class="form-input"
            @keyup.enter="onConfirm"
          />
        </el-form-item>
        <el-form-item label="医生姓名">
          <el-input
            v-model="query.doctorName"
            placeholder="按医生姓名搜索"
            clearable
            class="form-input"
            @keyup.enter="onConfirm"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部状态" clearable class="form-select">
            <el-option label="治疗中" :value="0" />
            <el-option label="已完成" :value="1" />
            <el-option label="已归档" :value="2" />
          </el-select>
        </el-form-item>

        <!-- 高级筛选（就诊日期范围，可选） -->
        <template v-if="advancedOpen">
          <el-form-item label="完成开始">
            <el-date-picker
              v-model="query.completedStart"
              type="date"
              placeholder="完成开始日期"
              value-format="YYYY-MM-DD"
              class="form-select w240"
            />
          </el-form-item>
          <el-form-item label="完成结束">
            <el-date-picker
              v-model="query.completedEnd"
              type="date"
              placeholder="完成结束日期"
              value-format="YYYY-MM-DD"
              class="form-select w240"
            />
          </el-form-item>
          <el-form-item label="就诊开始">
            <el-date-picker
              v-model="query.visitStart"
              type="date"
              placeholder="就诊开始日期"
              value-format="YYYY-MM-DD"
              class="form-select w240"
            />
          </el-form-item>
          <el-form-item label="就诊结束">
            <el-date-picker
              v-model="query.visitEnd"
              type="date"
              placeholder="就诊结束日期"
              value-format="YYYY-MM-DD"
              class="form-select w240"
            />
          </el-form-item>
        </template>

        <!-- 操作按钮 -->
        <el-form-item class="form-actions">
          <el-button @click="onReset">重置</el-button>
          <el-button type="primary" @click="onConfirm">确定</el-button>
          <el-button link type="primary" @click="advancedOpen = !advancedOpen">
            <span>{{ advancedOpen ? '收起' : '展开' }}</span>
            <el-icon class="toggle-icon"><component :is="advancedOpen ? ArrowUp : ArrowDown" /></el-icon>
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-table
      :data="list"
      border
      stripe
      v-loading="loading"
      element-loading-text="加载中..."
      element-loading-background="rgba(255,255,255,0.6)"
    >
      <el-table-column prop="id" label="ID" width="80" fixed />
      <!-- 病例主体：患者姓名 + 医生姓名 -->
      <el-table-column label="病例" min-width="260" fixed>
        <template #default="{ row }">
          <div style="display:flex;align-items:center;gap:10px;">
            <el-avatar size="small">{{ (row.patientName || '?').slice(0,1) }}</el-avatar>
            <div style="display:flex;flex-direction:column;line-height:1.2;">
              <span style="font-weight:600;color:var(--el-text-color-primary)">{{ row.patientName || '-' }}</span>
              <span style="font-size:12px;color:var(--el-text-color-secondary)">医生：{{ row.doctorName || '-' }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="diagnosis" label="诊断结果" min-width="220" show-overflow-tooltip />
      <el-table-column prop="visitDate" label="就诊日期" min-width="170">
        <template #default="{ row }">{{ formatTime(row.visitDate) }}</template>
      </el-table-column>
      <el-table-column prop="completedDate" label="完成日期" min-width="170">
        <template #default="{ row }">{{ formatTime(row.completedDate) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusInfo(row.status).type">{{ statusInfo(row.status).text }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleView(row)">详情</el-button>
        </template>
      </el-table-column>

      <!-- 空数据插槽 -->
      <template #empty>
        <div v-if="!loading" class="table-empty">{{ fetchError ? '数据异常，请稍后重试' : '暂无数据' }}</div>
      </template>
    </el-table>

    <!-- 分页 -->
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

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="病例档案详情"
      width="700px"
      append-to-body
      destroy-on-close
    >
      <div v-if="currentDetail" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="患者姓名">{{ currentDetail.patientName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="医生姓名">{{ currentDetail.doctorName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="就诊日期">{{ formatTime(currentDetail.visitDate) }}</el-descriptions-item>
          <el-descriptions-item label="完成日期">{{ formatTime(currentDetail.completedDate) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusInfo(currentDetail.status).type">{{ statusInfo(currentDetail.status).text }}</el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <div class="section-title">症状描述</div>
        <div class="text-content">{{ currentDetail.symptoms || '无' }}</div>

        <div class="section-title">诊断结果</div>
        <div class="text-content">{{ currentDetail.diagnosis || '无' }}</div>

        <div class="section-title">医生备注</div>
        <div class="text-content">{{ currentDetail.notes || '无' }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 页面逻辑（中文注释）：接入接口，请求与页面刷新同时进行；加载动画至少 1 秒；分页请求防抖
import { ref, onMounted, computed } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { formatTime, useDebounce } from '@/utils/common'
import { medicalRecordApi } from '@/api/modules/medicalRecord'
import type { MedicalRecordItem } from '@/api/types/medicalRecordTypes'

/** 高级筛选开关 */
const advancedOpen = ref(false)
const detailVisible = ref(false)
const currentDetail = ref<MedicalRecordItem | null>(null)

const handleView = (row: MedicalRecordItem) => {
  currentDetail.value = row
  detailVisible.value = true
}

/** 列表与状态 */
const list = ref<MedicalRecordItem[]>([])
const loading = ref(false)
const total = ref(0)
const fetchError = ref(false)

/** 查询参数（对齐后端查询字段） */
interface QueryState {
  page: number
  pageSize: number
  patientName?: string
  doctorName?: string
  status?: 0 | 1 | 2
  completedStart?: string
  completedEnd?: string
  visitStart?: string
  visitEnd?: string
}
const defaultQuery: QueryState = {
  page: 1,
  pageSize: 10,
  patientName: '',
  doctorName: '',
  status: undefined,
  completedStart: undefined,
  completedEnd: undefined,
  visitStart: undefined,
  visitEnd: undefined
}
const query = ref<QueryState>({ ...defaultQuery })

/** 将前端查询参数映射为后端分页入参结构 */
const buildPayload = (q: QueryState) => {
  return {
    pageNum: q.page,
    pageSize: q.pageSize,
    sortField: '',
    sortDirection: 'ASC',
    query: {
      patientName: q.patientName ?? '',
      doctorName: q.doctorName ?? '',
      status: typeof q.status === 'number' ? q.status : null,
      completedStart: q.completedStart ?? '',
      completedEnd: q.completedEnd ?? '',
      visitStart: q.visitStart ?? '',
      visitEnd: q.visitEnd ?? ''
    }
  }
}

/** 获取列表：至少 1 秒加载；异常时展示错误态空数据 */
const fetchList = async () => {
  if (loading.value) return
  loading.value = true
  fetchError.value = false
  const minDuration = 1000
  const start = Date.now()
  try {
    const payload = buildPayload(query.value)
    const res = await medicalRecordApi.getMedicalRecordPage(payload)
    const data = (res as any)?.data
    // 统一用户感知：保证至少 1 秒加载时长
    const elapsed = Date.now() - start
    if (elapsed < minDuration) {
      await new Promise(resolve => setTimeout(resolve, minDuration - elapsed))
    }
    list.value = (data?.list || []) as MedicalRecordItem[]
    total.value = Number((data?.total ?? 0) as any) || 0
  } catch (e) {
    console.warn('获取病例档案失败：', e)
    fetchError.value = true
    list.value = []
    total.value = 0
    const elapsed = Date.now() - start
    if (elapsed < minDuration) {
      await new Promise(resolve => setTimeout(resolve, minDuration - elapsed))
    }
  } finally {
    loading.value = false
  }
}

/** 防抖封装：分页与查询触发使用防抖，避免频繁请求 */
const fetchListDebounced = useDebounce(fetchList, 500)

/** 分页变化（防抖触发） */
const onPageChange = (p: number) => {
  query.value.page = p
  fetchListDebounced()
}
const onPageSizeChange = (size: number) => {
  query.value.pageSize = size
  query.value.page = 1
  fetchListDebounced()
}

/** 重置与确定 */
const onReset = () => {
  query.value = { ...defaultQuery }
  fetchList() // 重置后立即请求，保证数据与筛选一致
}
const onConfirm = () => {
  query.value.page = 1
  fetchListDebounced()
}

/** 状态标签显示 */
const statusInfo = (s?: number) => {
  switch (s) {
    case 0: return { text: '治疗中', type: 'info' as const }
    case 1: return { text: '已完成', type: 'success' as const }
    case 2: return { text: '已归档', type: 'warning' as const }
    default: return { text: '-', type: 'info' as const }
  }
}

onMounted(fetchList)
</script>

<style scoped>
.case-archive-page {
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

/* 与其他管理页一致的自适应表单布局 */
.query-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
}
.query-form :deep(.el-form-item) {
  flex: 0 1 260px;
  min-width: 220px;
  margin: 0 !important;
}
/* 操作按钮靠右 */
.query-form :deep(.form-actions) {
  display: flex;
  gap: 10px;
  margin-left: auto;
  flex: 0 0 auto;
  min-width: fit-content;
  justify-content: flex-end;
}

.toggle-icon {
  margin-left: 4px;
}

/* 统一控件尺寸 */
.form-input,
.form-select {
  width: 100%;
}
:deep(.form-input .el-input__wrapper),
:deep(.form-select .el-select__wrapper),
:deep(.el-range-editor.el-input__wrapper) {
  height: 40px;
}

/* 分页居中 */
.pager {
  display: flex;
  justify-content: center;
  padding-top: 0;
  margin-top: 10px;
}

/* 紧凑模式：未展开高级筛选时强制单行 */
.query-form.is-compact {
  flex-wrap: nowrap;
}

.section-title {
  font-weight: bold;
  font-size: 15px;
  margin-top: 20px;
  margin-bottom: 10px;
  color: var(--el-text-color-primary);
  border-left: 3px solid var(--el-color-primary);
  padding-left: 8px;
}

.text-content {
  line-height: 1.6;
  color: var(--el-text-color-regular);
  background-color: var(--el-fill-color-light);
  padding: 10px;
  border-radius: 4px;
}

.query-form.is-compact :deep(.el-form-item) {
  flex: 1 1 0;
  min-width: 0;
}
.query-form.is-compact :deep(.form-actions) {
  margin-left: auto;
  flex: 0 0 auto;
}
</style>
