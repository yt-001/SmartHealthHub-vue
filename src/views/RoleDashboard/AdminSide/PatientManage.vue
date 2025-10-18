<template>
  <!-- 患者管理列表页（中文注释） -->
  <div class="patient-page">
    <!-- 查询卡片 -->
    <el-card class="query-card" shadow="never">
      <el-form @submit.prevent :class="['query-form', { 'is-compact': !advancedOpen }]">
        <!-- 基础筛选 -->
        <el-form-item label="姓名">
          <el-input v-model="query.realName" placeholder="按姓名搜索" clearable class="form-input" @keyup.enter="onConfirm" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="query.phone" placeholder="按手机号搜索" clearable class="form-input" @keyup.enter="onConfirm" />
        </el-form-item>
        <el-form-item label="身份证号">
          <el-input v-model="query.idCard" placeholder="按身份证号搜索" clearable class="form-input" @keyup.enter="onConfirm" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="query.gender" placeholder="全部性别" clearable class="form-select">
            <el-option label="男" value="M" />
            <el-option label="女" value="F" />
            <el-option label="其他" value="O" />
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

        <!-- 高级筛选 -->
        <template v-if="advancedOpen">
          <el-form-item label="开始时间">
            <el-date-picker
              v-model="query.createdStart"
              type="date"
              placeholder="开始日期"
              value-format="YYYY-MM-DD"
              class="form-select w240"
            />
          </el-form-item>
          <el-form-item label="结束时间">
            <el-date-picker
              v-model="query.createdEnd"
              type="date"
              placeholder="结束日期"
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
      <!-- 合并：头像首字 + 姓名 + 登录账号 -->
      <el-table-column label="患者" min-width="220" fixed>
        <template #default="{ row }">
          <div style="display:flex;align-items:center;gap:10px;">
            <el-avatar size="small">{{ (row.realName || row.username || '?').slice(0,1) }}</el-avatar>
            <div style="display:flex;flex-direction:column;line-height:1.2;">
              <span style="font-weight:600;color:var(--el-text-color-primary)">{{ row.realName || '-' }}</span>
              <span style="font-size:12px;color:var(--el-text-color-secondary)">{{ row.username || '-' }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" min-width="150" />
      <el-table-column prop="idCard" label="身份证号" min-width="200" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.idCard || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" width="80">
        <template #default="{ row }">{{ genderText(row.gender) }}</template>
      </el-table-column>
      <el-table-column prop="birthDate" label="出生日期" min-width="120" />
      <el-table-column prop="bloodType" label="血型" width="80">
        <template #default="{ row }">
          <span>{{ bloodTypeText(row.bloodType) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusInfo(row.status).type">{{ statusInfo(row.status).text }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" min-width="180">
        <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
      </el-table-column>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue'
import { patientApi } from '@/api/modules/patient'
import type { PatientItem } from '@/api/types/patientTypes'
import { formatTime, useDebounce } from '@/utils/common'

const advancedOpen = ref(false)
const list = ref<PatientItem[]>([])
const loading = ref(false)
const total = ref(0)
const fetchError = ref(false)

interface QueryState {
  page: number
  pageSize: number
  realName?: string
  phone?: string
  idCard?: string
  gender?: 'M' | 'F' | 'O'
  status?: 0 | 1 | 2 | 3
  createdStart?: string
  createdEnd?: string
}

const defaultQuery: QueryState = {
  page: 1,
  pageSize: 10,
  realName: '',
  phone: '',
  idCard: '',
  gender: undefined,
  status: undefined,
  createdStart: undefined,
  createdEnd: undefined
}

const query = ref<QueryState>({ ...defaultQuery })

const buildPatientPayload = (q: QueryState) => {
  return {
    pageNum: q.page,
    pageSize: q.pageSize,
    sortField: '',
    sortDirection: 'ASC',
    query: {
      realName: q.realName ?? '',
      phone: q.phone ?? '',
      idCard: q.idCard ?? '',
      gender: q.gender ?? '',
      status: typeof q.status === 'number' ? q.status : null,
      createdStart: q.createdStart ?? '',
      createdEnd: q.createdEnd ?? ''
    }
  }
}

const fetchList = async () => {
  // 防止并发请求：如果当前在加载，忽略本次触发
  if (loading.value) return
  loading.value = true
  fetchError.value = false
  const minDuration = 1000
  const start = Date.now()
  try {
    const payload = buildPatientPayload(query.value)
    // 先立即发起接口请求
    const res = await patientApi.getPatientList(payload)
    // 接口返回后补足剩余时间，保证至少 1 秒加载
    const elapsed = Date.now() - start
    if (elapsed < minDuration) {
      await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed))
    }
    const data = (res as any)?.data
    list.value = (data?.list || []) as PatientItem[]
    total.value = data?.total || 0
  } catch (e) {
    console.warn('获取患者列表失败：', e)
    fetchError.value = true
    list.value = []
    total.value = 0
    // 失败情况下也补足剩余时间，统一用户感知
    const elapsed = Date.now() - start
    if (elapsed < minDuration) {
      await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed))
    }
  } finally {
    loading.value = false
  }
}

const fetchListDebounced = useDebounce(fetchList, 500)

const onPageChange = (p: number) => {
  query.value.page = p
  fetchListDebounced()
}
const onPageSizeChange = (size: number) => {
  query.value.pageSize = size
  query.value.page = 1
  fetchListDebounced()
}

const onReset = () => {
  query.value = { ...defaultQuery }
  fetchList()
}
const onConfirm = () => {
  query.value.page = 1
  fetchListDebounced()
}

const genderText = (g?: 'M' | 'F' | 'O') => (g === 'M' ? '男' : g === 'F' ? '女' : g === 'O' ? '其他' : '-')
const statusInfo = (s?: number) => {
  switch (s) {
    case 0: return { text: '正常', type: 'success' as const }
    case 1: return { text: '锁定', type: 'warning' as const }
    case 2: return { text: '未激活', type: 'info' as const }
    case 3: return { text: '已注销', type: 'danger' as const }
    default: return { text: '-', type: 'info' as const }
  }
}

// 将血型代码转为可读文本，兼容字符串/数字/空
const bloodTypeText = (v: unknown) => {
  if (v == null || v === '') return '-'
  const s = String(v).toUpperCase().trim()
  // 常见编码：'A'|'B'|'O'|'AB' 或 1..4
  if (s === 'A' || s === 'B' || s === 'O' || s === 'AB') return s
  if (s === '1') return 'A'
  if (s === '2') return 'B'
  if (s === '3') return 'O'
  if (s === '4') return 'AB'
  return s
}

onMounted(fetchList)
</script>

<style scoped>
.patient-page {
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
.query-card {
  margin-bottom: 12px;
  border: 1px solid var(--el-border-color-lighter);
  background: var(--el-bg-color);
}
.query-card :deep(.el-card__body) {
  padding: 12px;
}
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
.form-input,
.form-select {
  width: 100%;
}
:deep(.form-input .el-input__wrapper),
:deep(.form-select .el-select__wrapper),
:deep(.el-range-editor.el-input__wrapper) {
  height: 40px;
}
.pager {
  display: flex;
  justify-content: center;
  padding-top: 0;
  margin-top: 10px;
}
.query-form.is-compact {
  flex-wrap: nowrap;
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