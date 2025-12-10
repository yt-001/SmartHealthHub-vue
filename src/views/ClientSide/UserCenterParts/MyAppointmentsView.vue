<template>
  <div class="my-appointments">
    <div class="header">
      <h3>我的预约</h3>
      <div class="filters">
        <el-date-picker
          v-model="startTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="开始时间"
          clearable
          size="small"
          @change="onTimeChange"
        />
        <el-date-picker
          v-model="endTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          placeholder="结束时间"
          clearable
          size="small"
          @change="onTimeChange"
        />
        <el-select
        v-model="query.status"
        placeholder="状态筛选"
        clearable
        size="small"
        style="width: 120px"
        @change="onStatusChange"
      >
        <el-option label="全部" :value="undefined" />
        <el-option label="待确认" :value="0" />
        <el-option label="已确认" :value="1" />
        <el-option label="已完成" :value="2" />
        <el-option label="已取消" :value="3" />
      </el-select>
    </div>
    </div>

    <el-table v-loading="loading" :data="list" :height="tableHeight" style="width: 100%" border>
      <el-table-column prop="registrationNo" label="预约号" width="180">
        <template #default="{ row }">
          <span class="mono">{{ row.registrationNo || '-' }}</span>
        </template>
      </el-table-column>

      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="病情描述" min-width="220" show-overflow-tooltip />
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          <span>{{ formatDateTime(row.createdAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新时间" width="180">
        <template #default="{ row }">
          <span>{{ formatDateTime(row.updatedAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="openDetail(row)">查看</el-button>
          <el-popconfirm
            v-if="row.status === 0 || row.status === 1"
            title="确定要取消该预约吗？"
            @confirm="handleCancel(row)"
          >
            <template #reference>
              <el-button link type="danger" size="small">取消</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="fetchData"
      />
    </div>

    <!-- 详情抽屉 -->
    <el-drawer v-model="detailVisible" title="预约详情" size="520px" append-to-body>
      <div v-if="currentDetail" class="detail-body">
        <div class="detail-row">
          <span class="label">预约号</span>
          <span class="value mono">{{ currentDetail.registrationNo || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">就诊日期</span>
          <span class="value">{{ currentDetail.scheduleDate || '-' }} {{ getShiftLabel(currentDetail.shiftCode || '') }}</span>
        </div>
        <div class="detail-row">
          <span class="label">科室</span>
          <span class="value">{{ currentDetail.deptName || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">医生</span>
          <span class="value">{{ currentDetail.doctorName || '-' }} <span v-if="currentDetail.doctorTitle">（{{ currentDetail.doctorTitle }}）</span></span>
        </div>
        <div class="detail-row">
          <span class="label">专长</span>
          <span class="value">{{ currentDetail.specialty || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">诊室</span>
          <span class="value">{{ currentDetail.roomNo || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">创建时间</span>
          <span class="value">{{ formatDateTime(currentDetail.createdAt) }}</span>
        </div>
        <div class="detail-row" v-if="currentDetail.updatedAt">
          <span class="label">更新时间</span>
          <span class="value">{{ formatDateTime(currentDetail.updatedAt) }}</span>
        </div>
        <div class="detail-row">
          <span class="label">描述</span>
          <span class="value">{{ currentDetail.description || '-' }}</span>
        </div>
        <div class="detail-row">
          <span class="label">状态</span>
          <span class="value">
            <el-tag :type="getStatusTagType(currentDetail.status)">{{ getStatusLabel(currentDetail.status) }}</el-tag>
          </span>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { getAppointmentsByPatientPaged, updateAppointmentStatus, getAppointmentDetail, type AppointmentItem } from '@/api/modules/appointment'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const store = useUserStore()
const loading = ref(false)
const list = ref<AppointmentItem[]>([])
const total = ref(0)

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  patientId: store.userInfo?.id,
  status: undefined as number | undefined
})

const startTime = ref<string | undefined>(undefined)
const endTime = ref<string | undefined>(undefined)

/**
 * 表格固定表头高度（使表头不随列表滚动消失）
 */
const tableHeight = ref(480)

const detailVisible = ref(false)
const currentDetail = ref<AppointmentItem | null>(null)

// 状态映射
const statusMap: Record<number, string> = {
  0: '待确认',
  1: '已确认',
  2: '已完成',
  3: '已取消'
}

function getStatusLabel(status: number) {
  return statusMap[status] || '未知'
}

function getStatusTagType(status: number) {
  switch (status) {
    case 0: return 'warning'
    case 1: return 'success'
    case 2: return 'info'
    case 3: return 'danger'
    default: return 'info'
  }
}

// 时段映射 (复用 UserCenter 的逻辑)
const shiftMap: Record<string, string> = {
  'M': '上午',
  'A': '下午',
  'N': '晚上',
  'AM': '上午',
  'PM': '下午',
  'FULL': '全天'
}

function getShiftLabel(code: string) {
  return shiftMap[code] || code
}

function getShiftTagType(code: string) {
  if (code === 'M' || code === 'AM') return 'warning'
  if (code === 'A' || code === 'PM') return 'success'
  return 'primary'
}

/**
 * 格式化日期时间字符串
 */
function formatDateTime(dt?: string) {
  const s = dt || ''
  // 兼容 'YYYY-MM-DD HH:mm:ss' 或 ISO 字符串
  return s.replace('T', ' ').slice(0, 19)
}

/**
 * 获取当前时间字符串（YYYY-MM-DD HH:mm:ss）
 */
function nowString(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const yyyy = d.getFullYear()
  const mm = pad(d.getMonth() + 1)
  const dd = pad(d.getDate())
  const hh = pad(d.getHours())
  const mi = pad(d.getMinutes())
  const ss = pad(d.getSeconds())
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`
}

/**
 * 拉取预约列表数据
 */
async function fetchData() {
  loading.value = true
  try {
    const res = await getAppointmentsByPatientPaged(String(store.userInfo?.id || ''), {
      pageNum: query.pageNum,
      pageSize: query.pageSize,
      query: {
        patientId: String(store.userInfo?.id || ''),
        status: query.status,
        startTime: startTime.value || undefined,
        endTime: (endTime.value || nowString())
      }
    })
    if (res.code === 200) {
      list.value = res.data.list
      total.value = res.data.total
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

/**
 * 打开详情抽屉并根据ID拉取详情
 */
async function openDetail(row: AppointmentItem) {
  try {
    const res = await getAppointmentDetail(row.id)
    if (res.code === 200) {
      currentDetail.value = res.data
      detailVisible.value = true
    }
  } catch (e) {
    ElMessage.error('获取详情失败')
  }
}

/**
 * 状态筛选变化时重置页码并刷新
 */
function onStatusChange() {
  query.pageNum = 1
  fetchData()
}

/**
 * 时间筛选变化时重置页码并刷新
 */
function onTimeChange() {
  query.pageNum = 1
  fetchData()
}

/**
 * 取消预约并刷新列表
 */
async function handleCancel(row: AppointmentItem) {
  try {
    const res = await updateAppointmentStatus(row.id, 3)
    if (res.code === 200) {
      ElMessage.success('预约已取消')
      fetchData()
    } else {
      ElMessage.error(res.msg || '取消失败')
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

/**
 * 监听外部触发的刷新事件
 */
function handleExternalRefresh() {
  query.pageNum = 1
  fetchData()
}

onMounted(() => {
  window.addEventListener('appointments:refresh', handleExternalRefresh)
  fetchData()
})

onUnmounted(() => {
  window.removeEventListener('appointments:refresh', handleExternalRefresh)
})
</script>

<style scoped>
.my-appointments {
  padding: 0;
}

.header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #fff;
  /* 补偿 content-card 的 padding-top: 32px */
  margin-top: -32px;
  padding-top: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.filters {
  display: flex;
  gap: 12px;
  align-items: center;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.detail-row { display: flex; gap: 12px; }
.detail-row .label { width: 80px; color: var(--el-text-color-secondary); }
.detail-row .value { flex: 1; color: var(--el-text-color-primary); }
.mono { font-family: 'Roboto Mono', monospace; }
</style>
