<template>
  <div class="my-prescriptions-container">
    <div class="page-header">
      <h2>我的处方记录</h2>
      <p class="subtitle">查看医生为您开具的所有电子处方</p>
    </div>

    <div class="content-wrapper">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索医生姓名或诊断结果"
          prefix-icon="Search"
          clearable
          @clear="fetchData"
          @keyup.enter="fetchData"
          class="search-input"
        />
        <el-button type="primary" @click="fetchData">查询</el-button>
      </div>

      <!-- 列表 -->
      <div v-loading="loading" class="prescription-list">
        <el-empty v-if="!loading && list.length === 0" description="暂无处方记录" />
        
        <el-card 
          v-for="item in list" 
          :key="item.id" 
          class="prescription-card" 
          shadow="hover"
          @click="viewDetails(item)"
        >
          <div class="card-header-row">
            <span class="date">{{ formatTime(item.createdAt) }}</span>
            <el-tag :type="getStatusType(item.status)" effect="light">
              {{ getStatusText(item.status) }}
            </el-tag>
          </div>
          
          <div class="card-body">
            <div class="info-row">
              <span class="label">开方医生：</span>
              <span class="value">{{ item.doctorName }}</span>
            </div>
            <div class="info-row">
              <span class="label">诊断结果：</span>
              <span class="value diagnosis">{{ item.diagnosis || '无' }}</span>
            </div>
          </div>
          
          <div class="card-footer">
            <el-button link type="primary" @click.stop="viewDetails(item)">查看详情 >></el-button>
          </div>
        </el-card>
      </div>

      <!-- 分页 -->
      <div class="pagination-wrapper" v-if="total > 0">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          layout="prev, pager, next"
          :total="total"
          @current-change="fetchData"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="处方详情" width="600px" align-center>
      <div v-if="currentDetail" class="detail-content">
        <div class="detail-header">
          <div class="hospital-name">社区卫生服务中心电子处方</div>
          <div class="prescription-id">No. {{ String(currentDetail.id).padStart(8, '0') }}</div>
        </div>
        
        <el-divider border-style="dashed" />
        
        <el-descriptions :column="2" size="default">
          <el-descriptions-item label="姓名">{{ currentDetail.patientName }}</el-descriptions-item>
          <el-descriptions-item label="医生">{{ currentDetail.doctorName }}</el-descriptions-item>
          <el-descriptions-item label="时间" :span="2">{{ currentDetail.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="诊断" :span="2">
            <span class="diagnosis-text">{{ currentDetail.diagnosis }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <div class="rp-section">
          <div class="rp-title">Rp</div>
          <el-table :data="parsedMedications" stripe size="small" style="width: 100%">
            <el-table-column prop="drugName" label="药品名称" />
            <el-table-column prop="specification" label="规格" width="100" />
            <el-table-column prop="price" label="单价" width="80" align="right">
              <template #default="{ row }">¥{{ row.price || '-' }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" align="center" />
            <el-table-column prop="amount" label="小计" width="90" align="right">
              <template #default="{ row }">¥{{ row.amount || (row.price ? (row.price * row.quantity).toFixed(2) : '-') }}</template>
            </el-table-column>
            <el-table-column prop="usage" label="用法" />
          </el-table>
        </div>

        <div class="notes-section" v-if="currentDetail.notes">
          <span class="label">医嘱/备注：</span>
          <span class="content">{{ currentDetail.notes }}</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { prescriptionApi, type PrescriptionItem } from '@/api/modules/prescription'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(false)
const list = ref<PrescriptionItem[]>([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchKeyword = ref('')

const detailVisible = ref(false)
const currentDetail = ref<PrescriptionItem | null>(null)

const parsedMedications = computed(() => {
  if (!currentDetail.value?.medicationDetails) return []
  try {
    return JSON.parse(currentDetail.value.medicationDetails)
  } catch (e) {
    return []
  }
})

const fetchData = async () => {
  if (!userStore.userInfo?.id) return
  
  loading.value = true
  try {
    const res = await prescriptionApi.getPage({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      query: {
        userId: userStore.userInfo.id, // 只查询当前用户的
        doctorName: searchKeyword.value || undefined
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

const viewDetails = (item: PrescriptionItem) => {
  currentDetail.value = item
  detailVisible.value = true
}

const getStatusType = (status: number) => {
  const map: Record<number, string> = {
    0: 'warning',
    1: 'success',
    2: 'info'
  }
  return map[status] || 'info'
}

const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: '待取药',
    1: '已完成',
    2: '已作废'
  }
  return map[status] || '未知'
}

const formatTime = (timeStr: string) => {
  if (!timeStr) return ''
  return timeStr.split(' ')[0]
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.my-prescriptions-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}
.page-header h2 {
  font-size: 24px;
  color: #303133;
  margin-bottom: 8px;
}
.subtitle {
  color: #909399;
  font-size: 14px;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  max-width: 400px;
}

.prescription-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  min-height: 200px;
}

.prescription-card {
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 8px;
}
.prescription-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #EBEEF5;
}
.date {
  font-size: 14px;
  color: #606266;
}

.card-body {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
  font-size: 14px;
}
.label {
  color: #909399;
  width: 70px;
  flex-shrink: 0;
}
.value {
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.diagnosis {
  font-weight: 500;
}

.card-footer {
  text-align: right;
}

.pagination-wrapper {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

/* 详情样式 */
.detail-header {
  text-align: center;
  margin-bottom: 20px;
}
.hospital-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
}
.prescription-id {
  font-family: monospace;
  color: #909399;
}

.diagnosis-text {
  white-space: pre-wrap;
  line-height: 1.5;
}

.rp-section {
  margin-top: 20px;
}
.rp-title {
  font-size: 24px;
  font-weight: bold;
  font-style: italic;
  margin-bottom: 10px;
  color: #303133;
}

.notes-section {
  margin-top: 20px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
}
.notes-section .label {
  font-weight: bold;
  color: #606266;
}
</style>
