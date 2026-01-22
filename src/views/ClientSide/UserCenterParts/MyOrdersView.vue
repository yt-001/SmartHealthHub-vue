<template>
  <div class="my-orders-view">
    <div class="section-header">
      <h2>我的药品清单</h2>
      <el-button type="primary" link @click="fetchData">
        <el-icon><Refresh /></el-icon> 刷新
      </el-button>
    </div>

    <div v-loading="loading" class="order-list">
      <el-empty v-if="!loading && orders.length === 0" description="暂无药品订单" />
      
      <div v-else class="order-cards">
        <el-card v-for="order in orders" :key="order.id" class="order-card" shadow="hover">
          <div class="card-header">
            <span class="order-no">订单号：{{ order.orderNo }}</span>
            <el-tag :type="statusType(order.status)" effect="plain" size="small">
              {{ statusText(order.status) }}
            </el-tag>
          </div>
          
          <div class="card-content">
            <div class="info-row">
              <span class="label">药品名称：</span>
              <span class="value highlight">{{ order.medicineName }}</span>
            </div>
            <div class="info-row">
              <span class="label">数量：</span>
              <span class="value">x {{ order.quantity }}</span>
            </div>
            <div class="info-row">
              <span class="label">总价：</span>
              <span class="value price">¥{{ order.totalAmount }}</span>
            </div>
            <div class="info-row">
              <span class="label">下单时间：</span>
              <span class="value">{{ formatTime(order.createdAt) }}</span>
            </div>
             <div class="info-row">
              <span class="label">支付方式：</span>
              <span class="value">{{ order.paymentMethod === 'WeChat' ? '微信支付' : (order.paymentMethod || '未支付') }}</span>
            </div>
          </div>

          <div class="card-footer" v-if="order.status === 0">
             <el-button type="primary" size="small" @click="handlePay(order)">去支付</el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getUserOrders, payOrder } from '@/api/modules/order'
import { useUserStore } from '@/stores/user'
import type { MedicineOrder } from '@/api/types/orderTypes'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

const userStore = useUserStore()
const loading = ref(false)
const orders = ref<MedicineOrder[]>([])

onMounted(() => {
  fetchData()
})

const fetchData = async () => {
  if (!userStore.userInfo?.id) return
  loading.value = true
  try {
    const res = await getUserOrders(userStore.userInfo.id)
    if (res.code === 200 && res.data) {
      orders.value = res.data
    }
  } catch (e) {
    console.error(e)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

const statusText = (status: number) => {
  switch (status) {
    case 0: return '待支付'
    case 1: return '已支付'
    case 2: return '已取消' // 假设
    default: return '未知'
  }
}

const statusType = (status: number) => {
  switch (status) {
    case 0: return 'warning'
    case 1: return 'success'
    case 2: return 'info'
    default: return 'info'
  }
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return '-'
  return timeStr.replace('T', ' ')
}

const handlePay = async (order: MedicineOrder) => {
  // 这里简化处理，直接调用支付接口，实际应该弹窗扫码
  try {
    const res = await payOrder({
        orderId: order.id,
        paymentMethod: 'WeChat'
    })
    if (res.code === 200) {
        ElMessage.success('支付成功')
        fetchData()
    }
  } catch(e) {
    ElMessage.error('支付失败')
  }
}
</script>

<style scoped>
.my-orders-view {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  min-height: 400px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.section-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.order-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.order-card {
  transition: all 0.3s;
}
.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 12px;
  color: #999;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.info-row .label {
  color: #666;
}

.info-row .value {
  color: #333;
  font-weight: 500;
}

.highlight {
  color: var(--el-color-primary);
  font-weight: bold;
}

.price {
  color: #f56c6c;
  font-size: 16px;
}

.card-footer {
    margin-top: 15px;
    text-align: right;
    border-top: 1px solid #f5f5f5;
    padding-top: 10px;
}
</style>