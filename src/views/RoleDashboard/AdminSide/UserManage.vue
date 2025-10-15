<template>
  <!-- 用户管理列表页（中文注释） -->
  <div class="user-page">
    <!-- 查询卡片 -->
    <el-card class="query-card" shadow="never">
      <el-form @submit.prevent :class="['query-form', { 'is-compact': !advancedOpen }]">
        <!-- 基础筛选 -->
        <el-form-item label="账号">
          <el-input v-model="query.username" placeholder="按登录账号搜索" clearable class="form-input" @keyup.enter="onConfirm" />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input v-model="query.realName" placeholder="按姓名搜索" clearable class="form-input" @keyup.enter="onConfirm" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="query.phone" placeholder="按手机号搜索" clearable class="form-input" @keyup.enter="onConfirm" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="query.role" placeholder="全部角色" clearable class="form-select">
            <el-option label="管理员" :value="1" />
            <el-option label="医生" :value="2" />
            <el-option label="患者" :value="3" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部状态" clearable class="form-select">
            <el-option label="正常" :value="0" />
            <el-option label="锁定" :value="1" />
          </el-select>
        </el-form-item>

        <!-- 高级筛选 -->
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
      <!-- 合并：头像 + 姓名 + 登录账号 -->
      <el-table-column label="用户" min-width="240" fixed>
        <template #default="{ row }">
          <div style="display:flex;align-items:center;gap:10px;">
            <el-avatar :src="row.avatarUrl" size="small">{{ (row.realName || row.username || '?').slice(0,1) }}</el-avatar>
            <div style="display:flex;flex-direction:column;line-height:1.2;">
              <span style="font-weight:600;color:var(--el-text-color-primary)">{{ row.realName || '-' }}</span>
              <span style="font-size:12px;color:var(--el-text-color-secondary)">{{ row.username || '-' }}</span>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="role" label="角色" width="110">
        <template #default="{ row }">{{ roleText(row.role) }}</template>
      </el-table-column>
      <el-table-column prop="phone" label="手机号" min-width="150" />
      <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
      <el-table-column prop="birthDate" label="出生日期" min-width="120" />
      <el-table-column label="性别" width="80">
        <template #default="{ row }">{{ genderText(row.gender) }}</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="110">
        <template #default="{ row }">
          <el-tag :type="statusInfo(row.status).type">{{ statusInfo(row.status).text }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" min-width="170">
        <template #default="{ row }">{{ formatTime(row.createdAt || row.createTime) }}</template>
      </el-table-column>
      <el-table-column prop="updatedAt" label="更新时间" min-width="170">
        <template #default="{ row }">{{ formatTime(row.updatedAt || row.updateTime) }}</template>
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
import { systemUserApi } from '@/api/modules/systemUser'
import type { UserItem } from '@/api/types/userManageTypes'
import { formatTime, useDebounce } from '@/utils/common'

const advancedOpen = ref(false)
const list = ref<UserItem[]>([])
const loading = ref(false)
const total = ref(0)
const fetchError = ref(false)

interface QueryState {
  page: number
  pageSize: number
  username?: string
  realName?: string
  phone?: string
  role?: 1 | 2 | 3
  status?: 0 | 1
  createdRange?: [string, string] | []
}

const defaultQuery: QueryState = {
  page: 1,
  pageSize: 10,
  username: '',
  realName: '',
  phone: '',
  role: undefined,
  status: undefined,
  createdRange: []
}

const query = ref<QueryState>({ ...defaultQuery })

const buildUserPayload = (q: QueryState) => {
  const [createTimeStart, createTimeEnd] = (Array.isArray(q.createdRange) ? q.createdRange : []) as [string?, string?]
  return {
    pageNum: q.page,
    pageSize: q.pageSize,
    sortField: '',
    sortDirection: 'ASC',
    query: {
      username: q.username ?? '',
      realName: q.realName ?? '',
      phone: q.phone ?? '',
      role: typeof q.role === 'number' ? q.role : null,
      status: typeof q.status === 'number' ? q.status : null,
      createTimeStart: createTimeStart ?? '',
      createTimeEnd: createTimeEnd ?? ''
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
    const payload = buildUserPayload(query.value)
    // 先立即发起接口请求
    const res = await systemUserApi.getUserList(payload)
    // 接口返回后补足剩余时间，保证至少 1 秒加载
    const elapsed = Date.now() - start
    if (elapsed < minDuration) {
      await new Promise((resolve) => setTimeout(resolve, minDuration - elapsed))
    }
    const data = (res as any)?.data
    list.value = (data?.list || []) as UserItem[]
    total.value = data?.total || 0
  } catch (e) {
    console.warn('获取用户列表失败：', e)
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

const roleText = (r?: number) => {
  switch (r) {
    case 0: return '管理员'
    case 1: return '医生'
    case 2: return '患者'
    default: return '-'
  }
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

onMounted(fetchList)
</script>

<style scoped>
.user-page {
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