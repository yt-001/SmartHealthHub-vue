<template>
  <div class="records-container">
    <!-- 筛选头部 -->
    <div class="filter-card">
      <div class="left-panel">
        <h3 class="page-title">我的病例</h3>
        <span class="subtitle">共 {{ total }} 条就诊记录</span>
      </div>
      <div class="right-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          :shortcuts="shortcuts"
          class="filter-item date-picker"
          @change="onDateChange"
        />
        <el-select 
          v-model="status" 
          placeholder="就诊状态" 
          clearable 
          class="filter-item status-select" 
          @change="onFilterChange"
        >
          <el-option :value="0" label="治疗中" />
          <el-option :value="1" label="已完成" />
          <el-option :value="2" label="已归档" />
        </el-select>
        <el-button class="refresh-btn" :icon="Refresh" circle @click="fetchList" title="刷新列表" />
      </div>
    </div>

    <!-- 列表区域 -->
    <div class="list-content" v-loading="loading" element-loading-text="加载病例数据...">
      <el-table
        :data="list"
        style="width: 100%"
        :header-cell-style="{ background: '#f8fafc', color: '#475569', fontWeight: '600' }"
        :row-class-name="tableRowClassName"
        @row-click="openCase"
        class="custom-table"
      >
        <el-table-column prop="id" label="病例号" width="120" fixed="left">
          <template #default="{ row }">
            <span class="record-id">#{{ row.id }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="诊断信息" min-width="200">
          <template #default="{ row }">
            <div class="diagnosis-info">
              <div class="main-text">{{ row.diagnosis || '暂无诊断' }}</div>
              <div class="sub-text">
                <span class="label">主治医生：</span>
                {{ row.doctorName || '未分配' }}
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="就诊时间" width="180">
          <template #default="{ row }">
            <div class="time-info">
              <div class="date">{{ row.visitDate ? row.visitDate.split(' ')[0] : '-' }}</div>
              <div class="time">{{ row.visitDate ? row.visitDate.split(' ')[1] || '' : '' }}</div>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" effect="plain" round size="small">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" class="action-btn" @click.stop="openCase(row)">
              查看详情
            </el-button>
          </template>
        </el-table-column>
        
        <template #empty>
          <el-empty description="暂无就诊记录" :image-size="120" />
        </template>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-bar" v-if="total > 0">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          background
          @size-change="onPageSizeChange"
          @current-change="onPageChange"
        />
      </div>
    </div>

    <!-- 详情抽屉 -->
    <el-drawer
      v-model="drawerVisible"
      :show-close="false"
      size="520px"
      class="record-drawer"
      destroy-on-close
      append-to-body
    >
      <template #header="{ close, titleId, titleClass }">
        <div class="drawer-header">
          <div class="dh-left">
            <h4 :id="titleId" :class="titleClass">病例详情</h4>
            <el-tag :type="statusType(currentRecord?.status)" effect="dark" size="small" class="status-tag">
               {{ statusText(currentRecord?.status) }}
            </el-tag>
          </div>
          <el-button link @click="close">
            <el-icon size="20"><Close /></el-icon>
          </el-button>
        </div>
      </template>

      <div class="drawer-body" v-if="currentRecord">
        <!-- 头部卡片：患者与基本信息 -->
        <div class="detail-card header-card">
          <div class="patient-info">
            <el-avatar :size="64" :src="userAvatar" class="avatar">{{ userShort }}</el-avatar>
            <div class="meta">
              <div class="name">{{ userName }}</div>
              <div class="id-row">
                <span class="label">病例号</span>
                <span class="val mono">#{{ currentRecord.id }}</span>
              </div>
            </div>
          </div>
          <div class="visit-time">
            <div class="label">就诊时间</div>
            <div class="val">{{ currentRecord.visitDate || '-' }}</div>
          </div>
        </div>

        <!-- 诊断详情 -->
        <div class="detail-card">
          <div class="card-title">诊断信息</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">主治医生</span>
              <span class="value">{{ currentRecord.doctorName || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">就诊科室</span>
              <span class="value">全科</span>
            </div>
            <div class="info-item full">
              <span class="label">患者主诉</span>
              <span class="value">{{ currentRecord.symptoms || '未填写' }}</span>
            </div>
            <div class="info-item full">
              <span class="label">医生诊断</span>
              <span class="value highlight">{{ currentRecord.diagnosis || '暂无诊断' }}</span>
            </div>
            <div class="info-item full" v-if="currentRecord.completedDate">
              <span class="label">完成时间</span>
              <span class="value">{{ currentRecord.completedDate }}</span>
            </div>
          </div>
        </div>

        <!-- 医嘱/处方 -->
        <div class="detail-card">
          <div class="card-title">治疗方案与处方</div>
          
          <div class="info-grid">
            <div class="info-item full">
              <span class="label">治疗方案</span>
              <span class="value">{{ currentRecord.treatmentPlan || '暂无' }}</span>
            </div>
            
            <div class="info-item full">
              <span class="label">处方信息</span>
              <span class="value">{{ currentRecord.prescription || '暂无' }}</span>
            </div>
            
            <div class="info-item full">
              <span class="label">医生备注</span>
              <span class="value">{{ currentRecord.notes || '暂无' }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh, Document, Close } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { getMedicalRecordsByUserId } from '@/api/modules/medicalRecord'
import type { MedicalRecordItem } from '@/api/types/medicalRecordTypes'

const userStore = useUserStore()

// 状态定义
const list = ref<MedicalRecordItem[]>([])
const rawList = ref<MedicalRecordItem[]>([])
const loading = ref(false)
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const status = ref<number | undefined>(undefined)
const dateRange = ref<[string, string] | []>([])

const drawerVisible = ref(false)
const currentRecord = ref<MedicalRecordItem | null>(null)

// 快捷日期选项
const shortcuts = [
  { text: '最近一周', value: () => { const end = new Date(); const start = new Date(); start.setTime(start.getTime() - 3600 * 1000 * 24 * 7); return [start, end] } },
  { text: '最近一个月', value: () => { const end = new Date(); const start = new Date(); start.setTime(start.getTime() - 3600 * 1000 * 24 * 30); return [start, end] } },
  { text: '最近三个月', value: () => { const end = new Date(); const start = new Date(); start.setTime(start.getTime() - 3600 * 1000 * 24 * 90); return [start, end] } },
]

/** 获取用户姓名 */
const userName = computed(() => userStore.userInfo?.realName || userStore.userInfo?.username || '-')
/** 获取用户头像 */
const userAvatar = computed(() => userStore.userInfo?.avatarUrl || '')
/** 获取用户首字母 */
const userShort = computed(() => String(userName.value || '?').slice(0, 1))

/** 状态文案 */
function statusText(s: number | undefined): string {
  if (s === 0) return '治疗中'
  if (s === 1) return '已完成'
  if (s === 2) return '已归档'
  return '未知'
}

/** 状态标签类型 */
function statusType(s: number | undefined): 'success' | 'warning' | 'info' | 'danger' {
  if (s === 0) return 'warning'
  if (s === 1) return 'success'
  if (s === 2) return 'info'
  return 'info'
}

/** 表格行样式 */
const tableRowClassName = ({ rowIndex }: { rowIndex: number }) => {
  return 'record-row'
}

/**
 * 拉取列表
 * 
 * 字段展示说明（供后端参考）：
 * 【列表页】
 * 1. id: 病例号
 * 2. diagnosis: 诊断信息（若无则展示 symptoms）
 * 3. doctorName: 主治医生姓名
 * 4. visitDate: 就诊时间（yyyy-MM-dd HH:mm:ss）
 * 5. status: 状态（0治疗中, 1已完成, 2已归档）
 * 
 * 【详情页】
 * 1. id: 病例号
 * 2. doctorName: 主治医生
 * 3. visitDate: 就诊时间
 * 4. symptoms/diagnosis: 主诉或诊断结果
 * 5. completedDate: 完成时间（status=1时展示）
 * 6. status: 当前状态
 */
async function fetchList() {
  if (!userStore.userInfo?.id) return
  loading.value = true
  try {
    const res = await getMedicalRecordsByUserId(userStore.userInfo.id)
    const data = (res as any)?.data ?? []
    rawList.value = Array.isArray(data) ? (data as MedicalRecordItem[]) : []
    page.value = 1
    applyLocalFilter()
  } catch (e) {
    ElMessage.error('获取病例失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

/**
 * 本地筛选并分页
 */
function applyLocalFilter() {
  const [begin, end] = Array.isArray(dateRange.value) ? dateRange.value : []
  const s = typeof status.value === 'number' ? status.value : undefined
  const filtered = rawList.value.filter(r => {
    const statusOk = s === undefined ? true : r.status === s
    const dateOk = inDateRange(r.visitDate || '', begin, end)
    return statusOk && dateOk
  })
  // 按日期倒序排列
  filtered.sort((a, b) => {
    const da = new Date(a.visitDate || 0).getTime()
    const db = new Date(b.visitDate || 0).getTime()
    return db - da
  })
  
  total.value = filtered.length
  const start = (page.value - 1) * pageSize.value
  list.value = filtered.slice(start, start + pageSize.value)
}

/**
 * 判断就诊日期是否落入选择的日期范围
 */
function inDateRange(visitDate: string, begin?: string, end?: string): boolean {
  const d = (visitDate || '').slice(0, 10)
  const ge = begin ? d >= begin : true
  const le = end ? d <= end : true
  return ge && le
}

/** 翻页 */
function onPageChange(p: number) {
  page.value = p
  applyLocalFilter()
}

/** 分页尺寸变化 */
function onPageSizeChange(size: number) {
  pageSize.value = size
  page.value = 1
  applyLocalFilter()
}

/** 日期变化 */
function onDateChange() {
  page.value = 1
  applyLocalFilter()
}

/** 其他筛选变化 */
function onFilterChange() {
  page.value = 1
  applyLocalFilter()
}

/** 打开病例详情 */
function openCase(row: MedicalRecordItem) {
  currentRecord.value = row
  drawerVisible.value = true
}

onMounted(fetchList)
</script>

<style scoped>
.records-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

/* 筛选头部 */
.filter-card {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  /* 补偿 content-card 的 padding-top: 32px */
  margin-top: -32px;
  padding-top: 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.left-panel .page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 4px 0;
}

.left-panel .subtitle {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.right-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-item {
  width: 200px;
}

.status-select {
  width: 140px;
}

/* 列表区域 */
.list-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.custom-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.record-id {
  font-family: 'Roboto Mono', monospace;
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.diagnosis-info .main-text {
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.diagnosis-info .sub-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.time-info .date {
  color: var(--el-text-color-regular);
}

.time-info .time {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}

.pagination-bar {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: 16px;
}

/* 抽屉样式 */
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 16px;
}

.dh-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dh-left h4 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.drawer-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.detail-card {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.02);
}

.header-card {
  background: linear-gradient(to right, #f8fafc, #fff);
  border-left: 4px solid var(--el-color-primary);
}

.patient-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.patient-info .name {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.patient-info .id-row {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  display: flex;
  gap: 6px;
}

.visit-time {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px dashed var(--el-border-color-lighter);
  font-size: 13px;
}

.visit-time .label { color: var(--el-text-color-secondary); }
.visit-time .val { font-weight: 500; color: var(--el-text-color-primary); }

.card-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid var(--el-color-primary);
  line-height: 1.2;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full {
  grid-column: span 2;
}

.info-item .label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.info-item .value {
  font-size: 14px;
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.info-item .value.highlight {
  color: var(--el-color-primary-dark-2);
  line-height: 1.5;
}

.empty-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 0;
  color: var(--el-text-color-placeholder);
  gap: 8px;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .filter-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .right-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .filter-item {
    flex: 1;
    min-width: 120px;
  }

  .refresh-btn {
    margin-left: auto;
  }

  /* 在小屏幕下隐藏部分非关键列，或调整表格样式 */
  .custom-table :deep(.el-table__header) {
    font-size: 13px;
  }
  
  .custom-table :deep(.cell) {
    padding: 0 8px;
  }
}
</style>
