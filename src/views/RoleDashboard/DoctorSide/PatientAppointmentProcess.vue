<template>
  <div class="patient-appointment-process">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <span class="title">患者预约处理</span>
            <el-tag type="info" class="ml-2">共 {{ total }} 条待处理</el-tag>
          </div>
          <div class="header-right">
            <el-button type="primary" :icon="Refresh" circle @click="refreshData" :loading="loading" />
          </div>
        </div>
      </template>

      <!-- 筛选区域（虽然只要求待确认，但为了扩展性保留状态展示，当前默认选中0） -->
      <div class="filter-container mb-4">
        <el-radio-group v-model="query.status" @change="handleStatusChange">
          <el-radio-button :label="0">待确认</el-radio-button>
          <el-radio-button :label="1">已确认</el-radio-button>
          <el-radio-button :label="2">已就诊</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 列表区域 -->
      <el-table
        v-loading="loading"
        :data="appointmentList"
        style="width: 100%"
        stripe
        border
      >
        <el-table-column prop="registrationNo" label="预约编号" width="200" />
        <el-table-column prop="patientName" label="患者姓名" width="140" />
        <el-table-column label="性别" width="90">
          <template #default="{ row }">
            {{ row.patientGender === 'M' ? '男' : row.patientGender === 'F' ? '女' : '未知' }}
          </template>
        </el-table-column>
        <el-table-column prop="scheduleId" label="排班ID" width="220" />
        <el-table-column prop="patientId" label="患者ID" width="160" />
        <el-table-column prop="description" label="病情描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="申请时间" width="180" sortable />
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 0" type="warning">待确认</el-tag>
            <el-tag v-else-if="row.status === 1" type="primary">已确认</el-tag>
            <el-tag v-else-if="row.status === 2" type="success">已就诊</el-tag>
            <el-tag v-else-if="row.status === 3" type="info">已取消</el-tag>
            <el-tag v-else type="info">未知</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right" align="center">
          <template #default="{ row }">
            <div v-if="row.status === 0">
              <el-button type="primary" link size="small" @click="confirmAppointment(row)">
                确认预约
              </el-button>
              <el-button type="success" link size="small" @click="diagnoseAppointment(row)">
                完成就诊
              </el-button>
              <el-button type="info" link size="small" @click="openDetail(row)">查看</el-button>
            </div>
            <div v-else-if="row.status === 1">
              <el-button type="success" link size="small" @click="diagnoseAppointment(row)">
                完成就诊
              </el-button>
              <el-button type="info" link size="small" @click="openDetail(row)">查看</el-button>
            </div>
            <div v-else>
              <el-button type="info" link size="small" @click="openDetail(row)">查看</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <div class="pagination-container mt-4 flex justify-end">
        <el-pagination
          v-model:current-page="pageNum"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 右侧详情抽屉 -->
    <el-drawer v-model="detailVisible" title="预约详情" size="500px" direction="rtl" destroy-on-close>
      <div v-if="currentDetail" class="detail-container">
        <!-- 状态展示 -->
        <div class="status-section mb-6">
           <el-steps :active="currentDetail.status + 1" finish-status="success" align-center v-if="currentDetail.status >= 0 && currentDetail.status <= 2">
            <el-step title="提交申请" :description="currentDetail.createdAt" />
            <el-step title="医生确认" />
            <el-step title="完成就诊" />
          </el-steps>
           <el-alert v-else-if="currentDetail.status === 3" title="该预约已取消" type="info" show-icon :closable="false" />
           <el-alert v-else title="状态未知" type="warning" show-icon :closable="false" />
        </div>

        <div class="section-title">
          <el-icon><User /></el-icon>
          <span class="ml-2">患者信息</span>
        </div>
        <el-descriptions :column="1" border size="small" class="mb-4">
          <el-descriptions-item label="姓名">{{ currentDetail.patientName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="性别">
            <el-tag :type="currentDetail.patientGender === 'M' ? '' : 'danger'" size="small" effect="plain">
              {{ currentDetail.patientGender === 'M' ? '男' : currentDetail.patientGender === 'F' ? '女' : '未知' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="出生日期">{{ currentDetail.patientBirthDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentDetail.patientPhone || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-title">
          <el-icon><Tickets /></el-icon>
          <span class="ml-2">预约信息</span>
        </div>
        <el-descriptions :column="1" border size="small" class="mb-4">
          <el-descriptions-item label="挂号单号">
            <span class="mono-text">{{ currentDetail.registrationNo }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="排班ID">
            <span class="mono-text">{{ currentDetail.scheduleId }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="患者ID">
            <span class="mono-text">{{ currentDetail.patientId }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间">{{ currentDetail.createdAt || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-title">
          <el-icon><Document /></el-icon>
          <span class="ml-2">病情描述</span>
        </div>
        <div class="description-box">
          {{ currentDetail.description || '暂无描述' }}
        </div>
      </div>
    </el-drawer>

    <!-- 就诊完成反馈页面（弹窗形式回显） -->
    <el-dialog
      v-model="successVisible"
      title="操作成功"
      width="400px"
      center
      align-center
      destroy-on-close
    >
      <el-result
        icon="success"
        title="就诊已完成"
        sub-title="恭喜您！您又完成了一次专业的诊疗服务。"
      >
        <template #extra>
          <el-button type="primary" @click="successVisible = false">返回列表继续工作</el-button>
        </template>
      </el-result>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh, User, Tickets, Document } from '@element-plus/icons-vue'
import { getAppointmentsByDoctorPaged, updateAppointmentStatus, type AppointmentItem } from '@/api/modules/appointment'
// 获取预约列表接口需要传递当前用户ID，而非医生档案主键ID
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const appointmentList = ref<AppointmentItem[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)
const doctorId = ref<number | string>('')

// 查询条件
const query = reactive({
  status: 0 // 默认只看待确认
})

// 初始化
onMounted(async () => {
  if (userStore.userInfo?.id) {
    // 直接使用当前登录用户ID作为医生标识
    doctorId.value = userStore.userInfo.id
    fetchData()
  } else {
    ElMessage.error('未获取到当前用户信息')
  }
})

/**
 * 加载预约数据（传入当前用户ID）
 */
const fetchData = async () => {
    const uid = String(userStore.userInfo?.id || '')
    if (!uid) return
  
  loading.value = true
  try {
    const params = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      query: {
        status: query.status
      }
    }
    const res = await getAppointmentsByDoctorPaged(uid, params)
    
    if (res.code === 200 && res.data) {
      appointmentList.value = res.data.list
      total.value = res.data.total
    } else {
      appointmentList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('获取预约列表失败:', error)
    ElMessage.error('获取预约列表失败')
  } finally {
    loading.value = false
  }
}

// 刷新
  const refreshData = () => {
    pageNum.value = 1
    fetchData()
  }

// 状态筛选改变
const handleStatusChange = () => {
  pageNum.value = 1
  fetchData()
}

// 分页
const handleSizeChange = (val: number) => {
  pageSize.value = val
  fetchData()
}
  const handleCurrentChange = (val: number) => {
    pageNum.value = val
    fetchData()
  }

  /**
   * 打开详情抽屉（右侧）
   */
  const detailVisible = ref(false)
  const currentDetail = ref<AppointmentItem | null>(null)
  const openDetail = (row: AppointmentItem) => {
    currentDetail.value = row
    detailVisible.value = true
  }

// 确认预约 (Status 0 -> 1)
const confirmAppointment = async (row: AppointmentItem) => {
  try {
    await ElMessageBox.confirm(
      `确定要确认患者 ${row.patientName || ''} 的预约吗？`,
      '确认预约',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    const res = await updateAppointmentStatus(row.id, 1)
    if (res.code === 200) {
      ElMessage.success('预约已确认')
      fetchData() // 刷新列表
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (e) {
    // Cancelled
  }
}

// 成功反馈状态
const successVisible = ref(false)

// 完成就诊 (直接调用接口更新状态为2)
const diagnoseAppointment = async (row: AppointmentItem) => {
  try {
    await ElMessageBox.confirm(
      `确认将患者 ${row.patientName || ''} 的预约标记为已就诊吗？`,
      '完成就诊',
      {
        confirmButtonText: '确认完成',
        cancelButtonText: '取消',
        type: 'success'
      }
    )

    const res = await updateAppointmentStatus(row.id, 2)
    if (res.code === 200) {
      // 显示成功反馈页面（弹窗）
      successVisible.value = true
      fetchData() // 刷新列表
    } else {
      ElMessage.error(res.msg || '操作失败')
    }
  } catch (e) {
    // Cancelled or Error
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

// 查看详情
const viewPatientDetail = (row: AppointmentItem) => {
  router.push({
    path: '/doctor/patient-list',
    query: {
      patientId: String(row.patientId),
      appointmentId: String(row.id)
    }
  })
}
</script>

<style scoped>
.patient-appointment-process {
  padding: 20px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left {
  display: flex;
  align-items: center;
}
.title {
  font-size: 18px;
  font-weight: bold;
}
.filter-container {
  display: flex;
  align-items: center;
}
.patient-info {
  display: flex;
  align-items: center;
}

/* Drawer Styles */
.detail-container {
  padding: 0 10px;
}
.status-section {
  margin-bottom: 24px;
}
.section-title {
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 12px;
  margin-top: 24px;
}
.mono-text {
  font-family: Consolas, Monaco, monospace;
  color: #606266;
}
.description-box {
  background-color: #f5f7fa;
  padding: 12px;
  border-radius: 4px;
  color: #606266;
  line-height: 1.6;
  font-size: 14px;
  min-height: 60px;
}
.mb-4 {
  margin-bottom: 16px;
}
.mb-6 {
  margin-bottom: 24px;
}
.ml-2 {
  margin-left: 8px;
}
</style>
