<template>
  <!-- 药品订单管理列表页 -->
  <div class="order-manage-page">
    <!-- 查询卡片 -->
    <el-card class="query-card" shadow="never">
      <el-form @submit.prevent :class="['query-form']">
        <el-form-item label="订单号">
          <el-input
            v-model="query.orderNo"
            placeholder="按订单号搜索"
            clearable
            class="form-input"
            @keyup.enter="onConfirm"
          />
        </el-form-item>
        <el-form-item label="药品名称">
          <el-input
            v-model="query.medicineName"
            placeholder="按药品名称搜索"
            clearable
            class="form-input"
            @keyup.enter="onConfirm"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="query.status" placeholder="全部状态" clearable class="form-select">
            <el-option label="待支付" :value="0" />
            <el-option label="已支付" :value="1" />
            <el-option label="已取药" :value="2" />
            <el-option label="已取消" :value="3" />
          </el-select>
        </el-form-item>

        <el-form-item class="form-actions">
          <el-button @click="onReset">重置</el-button>
          <el-button type="primary" @click="onConfirm">查询</el-button>
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
      <el-table-column prop="orderNo" label="订单号" min-width="180" fixed />
      <el-table-column prop="medicineName" label="药品名称" min-width="150" />
      <el-table-column prop="price" label="单价" width="100">
        <template #default="{ row }">
          ¥{{ row.price }}
        </template>
      </el-table-column>
      <el-table-column prop="quantity" label="数量" width="80" />
      <el-table-column prop="totalAmount" label="总金额" width="120">
        <template #default="{ row }">
          <span style="color: #f56c6c; font-weight: bold;">¥{{ row.totalAmount }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="paymentTime" label="支付时间" width="180">
        <template #default="{ row }">
          {{ row.paymentTime ? new Date(row.paymentTime).toLocaleString() : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ new Date(row.createdAt).toLocaleString() }}
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="query.page"
        v-model:page-size="query.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="onPageSizeChange"
        @current-change="onPageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getOrderPage } from '@/api/modules/order'
import type { MedicineOrder } from '@/api/types/orderTypes'
import { useDebounce } from '@/utils/common'

const list = ref<MedicineOrder[]>([])
const loading = ref(false)
const total = ref(0)

interface QueryState {
  page: number
  pageSize: number
  orderNo?: string
  medicineName?: string
  status?: number
}

const defaultQuery: QueryState = {
  page: 1,
  pageSize: 10,
  orderNo: '',
  medicineName: '',
  status: undefined
}

const query = ref<QueryState>({ ...defaultQuery })

const getStatusType = (status: number) => {
  switch (status) {
    case 0: return 'warning'
    case 1: return 'success'
    case 2: return 'success'
    case 3: return 'info'
    default: return 'info'
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '待支付'
    case 1: return '已支付'
    case 2: return '已取药'
    case 3: return '已取消'
    default: '未知'
  }
}

const buildPayload = (q: QueryState) => {
  return {
    pageNum: q.page,
    pageSize: q.pageSize,
    query: {
      orderNo: q.orderNo || null,
      medicineName: q.medicineName || null,
      status: q.status
    }
  }
}

const fetchList = async () => {
  loading.value = true
  try {
    const payload = buildPayload(query.value)
    const res = await getOrderPage(payload)
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

const fetchListDebounced = useDebounce(fetchList, 500)

const onConfirm = () => {
  query.value.page = 1
  fetchList()
}

const onReset = () => {
  Object.assign(query.value, defaultQuery)
  fetchList()
}

const onPageChange = (p: number) => {
  query.value.page = p
  fetchListDebounced()
}

const onPageSizeChange = (size: number) => {
  query.value.pageSize = size
  query.value.page = 1
  fetchListDebounced()
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped lang="scss">
.order-manage-page {
  padding: 20px;

  .query-card {
    margin-bottom: 20px;
    :deep(.el-card__body) {
      padding: 18px 20px;
    }
  }

  .query-form {
    display: flex;
    flex-wrap: wrap;
    gap: 10px 24px;

    .el-form-item {
      margin-bottom: 0;
      display: flex;
      align-items: center;
    }

    .form-input,
    .form-select {
      width: 200px;
    }

    .form-actions {
      margin-left: auto;
      display: flex;
      gap: 10px;
    }
  }

  .pagination-container {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
