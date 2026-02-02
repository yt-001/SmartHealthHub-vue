<template>
  <div class="prescription-history-container">
    <!-- 顶部搜索 -->
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="患者姓名">
          <el-input v-model="searchForm.patientName" placeholder="请输入患者姓名" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="待取药" :value="0" />
            <el-option label="已完成" :value="1" />
            <el-option label="已作废" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon> 查询
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon> 重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表展示 -->
    <el-card shadow="never" class="list-card">
      <el-table 
        v-loading="loading" 
        :data="tableData" 
        border 
        stripe 
        style="width: 100%"
        height="100%"
      >
        <el-table-column prop="id" label="ID" width="80" align="center" />
        <el-table-column prop="patientName" label="患者姓名" width="120" />
        <el-table-column prop="diagnosis" label="诊断结果" min-width="150" show-overflow-tooltip />
        <el-table-column label="处方详情" width="100" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewDetails(row)">查看</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="warning">待取药</el-tag>
            <el-tag v-else-if="row.status === 1" type="success">已完成</el-tag>
            <el-tag v-else type="info">已作废</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="开方时间" width="170" align="center" />
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog 
      v-model="detailVisible" 
      title="处方详情" 
      width="60%"
      :close-on-click-modal="true"
      align-center
      destroy-on-close
    >
      <div v-if="currentDetail" class="detail-content">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="处方编号">{{ currentDetail.id }}</el-descriptions-item>
          <el-descriptions-item label="患者姓名">{{ currentDetail.patientName }}</el-descriptions-item>
          <el-descriptions-item label="开方医生">{{ currentDetail.doctorName }}</el-descriptions-item>
          <el-descriptions-item label="开方时间">{{ currentDetail.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="有效期">
            <el-tag type="warning" effect="plain">3天</el-tag>
            <span class="valid-date" v-if="validUntil"> (至 {{ validUntil }})</span>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag v-if="currentDetail.status === 0" type="warning">待取药</el-tag>
            <el-tag v-else-if="currentDetail.status === 1" type="success">已完成</el-tag>
            <el-tag v-else type="info">已作废</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="诊断结果" :span="3">{{ currentDetail.diagnosis }}</el-descriptions-item>
          <el-descriptions-item label="医嘱/备注" :span="3">{{ currentDetail.notes || '无' }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-title">药品明细</div>
        <el-table :data="parsedMedications" border stripe size="small" style="width: 100%">
          <el-table-column prop="drugName" label="药品名称" min-width="150" />
          <el-table-column prop="specification" label="规格" width="120" />
          <el-table-column prop="price" label="单价" width="100" align="right">
             <template #default="{ row }">¥{{ row.price || '-' }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" align="center" />
          <el-table-column prop="amount" label="小计" width="90" align="right">
             <template #default="{ row }">¥{{ row.amount || (row.price ? (row.price * row.quantity).toFixed(2) : '-') }}</template>
          </el-table-column>
          <el-table-column prop="usage" label="用法" min-width="150" />
          <el-table-column prop="notes" label="备注" min-width="100" show-overflow-tooltip />
        </el-table>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { prescriptionApi, type PrescriptionItem } from '@/api/modules/prescription'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(false)
const tableData = ref<PrescriptionItem[]>([])
const detailVisible = ref(false)
const currentDetail = ref<PrescriptionItem | null>(null)

const searchForm = reactive({
  patientName: '',
  status: undefined as number | undefined
})

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 解析药品详情JSON
const parsedMedications = computed(() => {
  if (!currentDetail.value?.medicationDetails) return []
  try {
    return JSON.parse(currentDetail.value.medicationDetails)
  } catch (e) {
    console.error('解析药品详情失败', e)
    return []
  }
})

// 计算有效期（假设3天）
const validUntil = computed(() => {
  if (!currentDetail.value?.createdAt) return ''
  try {
    const date = new Date(currentDetail.value.createdAt)
    date.setDate(date.getDate() + 3)
    return date.toLocaleString()
  } catch (e) {
    return ''
  }
})

const fetchData = async () => {
  loading.value = true
  try {
    // 获取当前登录医生ID
    const doctorId = userStore.userInfo?.id
    if (!doctorId) {
      ElMessage.warning('无法获取当前医生信息，请重新登录')
      loading.value = false
      return
    }

    const res = await prescriptionApi.getPage({
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      query: {
        patientName: searchForm.patientName || undefined,
        status: searchForm.status,
        doctorId: doctorId // 仅查询当前医生的处方
      }
    })
    if (res.code === 200) {
      tableData.value = res.data.list
      pagination.total = res.data.total
    } else {
      ElMessage.error(res.message || '获取数据失败')
    }
  } catch (error) {
    console.error('Fetch error:', error)
    ElMessage.error('系统错误，请重试')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.pageNum = 1
  fetchData()
}

const resetSearch = () => {
  searchForm.patientName = ''
  searchForm.status = undefined
  handleSearch()
}

const handleSizeChange = (val: number) => {
  pagination.pageSize = val
  fetchData()
}

const handleCurrentChange = (val: number) => {
  pagination.pageNum = val
  fetchData()
}

const viewDetails = (row: PrescriptionItem) => {
  currentDetail.value = row
  detailVisible.value = true
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.prescription-history-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
}

.search-card {
  flex-shrink: 0;
}

.list-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-weight: bold;
  font-size: 16px;
  border-left: 4px solid #409EFF;
  padding-left: 10px;
  margin-top: 10px;
}

:deep(.el-table__inner-wrapper) {
  height: 100%;
}
</style>