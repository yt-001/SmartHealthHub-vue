<template>
  <div class="health-records-container">
    <!-- 顶部仪表盘 -->
    <div class="dashboard-grid">
      <!-- 健康档案卡片 -->
      <el-card class="dashboard-card profile-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span><el-icon><User /></el-icon> 基础健康信息</span>
            <el-tag
              v-if="healthProfile?.idCardVerified !== undefined && healthProfile?.idCardVerified !== null"
              size="small"
              :type="getVerifyTagType(healthProfile?.idCardVerified)"
            >
              {{ getVerifyText(healthProfile?.idCardVerified) }}
            </el-tag>
            <el-button link type="primary" @click="openEditProfile">编辑</el-button>
          </div>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="血型">
            <el-tag size="small" :type="getBloodTypeTag(healthProfile?.bloodType)">
              {{ healthProfile?.bloodType || '未填写' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="过敏史">
            {{ healthProfile?.allergyHistory || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="慢性病史" :span="2">
            {{ healthProfile?.chronicDisease || '无' }}
          </el-descriptions-item>
          <el-descriptions-item label="当前症状" :span="2">
            {{ healthProfile?.currentSymptoms || '暂无记录' }}
          </el-descriptions-item>
          <el-descriptions-item label="当前治疗" :span="2">
            {{ healthProfile?.currentPlan || '暂无记录' }}
          </el-descriptions-item>
          <el-descriptions-item label="医嘱建议" :span="2">
            {{ healthProfile?.nextStep || '暂无记录' }}
          </el-descriptions-item>
          <el-descriptions-item label="居住地址" :span="2">
            {{ healthProfile?.address || '未填写' }}
          </el-descriptions-item>
          <el-descriptions-item label="紧急联系人">
            {{ healthProfile?.emergencyName || '未设置' }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            {{ healthProfile?.emergencyPhone || '-' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 健康数据统计图表 -->
      <el-card class="dashboard-card chart-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span><el-icon><TrendCharts /></el-icon> 就医统计</span>
            <el-button type="primary" link size="small" @click="exportReport">导出报告</el-button>
          </div>
        </template>
        <div ref="chartRef" class="chart-container"></div>
      </el-card>
    </div>



    <!-- 就诊记录列表（原有功能） -->
    <div class="records-list-section">
      <div class="filter-card">
        <div class="left-panel">
          <h3 class="page-title">就诊记录时间轴</h3>
          <span class="subtitle">共 {{ total }} 条记录</span>
        </div>
        <div class="right-actions">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            class="filter-item date-picker"
            @change="onDateChange"
          />
          <el-button class="refresh-btn" :icon="Refresh" circle @click="fetchList" title="刷新列表" />
        </div>
      </div>

      <div class="list-content" v-loading="loading">
        <el-timeline v-if="list.length > 0">
          <el-timeline-item
            v-for="item in list"
            :key="item.id"
            :timestamp="item.visitDate"
            placement="top"
            :type="item.status === 1 ? 'success' : 'primary'"
            :hollow="item.status === 0"
          >
            <el-card class="timeline-card" shadow="hover" @click="openCase(item)">
              <div class="timeline-header">
                <h4>{{ item.diagnosis || '待诊断' }}</h4>
                <el-tag :type="statusType(item.status)" size="small">{{ statusText(item.status) }}</el-tag>
              </div>
              <p class="timeline-doctor">主治医生：{{ item.doctorName }}</p>
              <p class="timeline-desc">{{ item.symptoms || '无主诉描述' }}</p>
            </el-card>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无就诊记录" />
      </div>
    </div>

    <!-- 详情抽屉 (保持原有) -->
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

        <div class="detail-card">
          <div class="card-title">诊断信息</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">主治医生</span>
              <span class="value">{{ currentRecord.doctorName || '-' }}</span>
            </div>
            <div class="info-item full">
              <span class="label">患者主诉</span>
              <span class="value">{{ currentRecord.symptoms || '未填写' }}</span>
            </div>
            <div class="info-item full">
              <span class="label">医生诊断</span>
              <span class="value highlight">{{ currentRecord.diagnosis || '暂无诊断' }}</span>
            </div>
          </div>
        </div>

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

    <!-- 编辑档案弹窗 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑健康档案"
      width="600px"
      destroy-on-close
      append-to-body
    >
      <el-form :model="editForm" :rules="rules" ref="editFormRef" label-width="100px">
        <el-form-item label="身份证号" prop="idCard">
          <el-input v-model="editForm.idCard" placeholder="请输入身份证号（审核必填，不支持脱敏号）" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="血型" prop="bloodType">
              <el-select v-model="editForm.bloodType" placeholder="请选择血型" style="width: 100%">
                <el-option label="A型" value="A" />
                <el-option label="B型" value="B" />
                <el-option label="AB型" value="AB" />
                <el-option label="O型" value="O" />
                <el-option label="RH阴性" value="RH-" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
              <el-form-item label="紧急联系电话" prop="emergencyPhone">
              <el-input v-model="editForm.emergencyPhone" placeholder="请输入手机号（审核必填，不回显历史号码）" />
            </el-form-item>
          </el-col>
        </el-row>
        
        <el-form-item label="紧急联系人" prop="emergencyName">
          <el-input v-model="editForm.emergencyName" placeholder="请输入紧急联系人姓名（审核必填）" />
        </el-form-item>
        
        <el-form-item label="居住地址" prop="address">
          <el-input v-model="editForm.address" placeholder="请输入常住地址（审核必填）" />
        </el-form-item>

        <el-form-item label="过敏史" prop="allergyHistory">
          <el-input v-model="editForm.allergyHistory" type="textarea" :rows="2" placeholder="如有过敏史请详细说明" />
        </el-form-item>

        <el-form-item label="慢性病史">
          <el-input v-model="editForm.chronicDisease" type="textarea" :rows="2" placeholder="如有慢性病史请详细说明" />
        </el-form-item>

          <el-divider content-position="left">当前状况（审核必填）</el-divider>

          <el-form-item label="当前症状" prop="currentSymptoms">
          <el-input v-model="editForm.currentSymptoms" type="textarea" :rows="2" placeholder="描述当前身体不适症状" />
        </el-form-item>
        
        <!-- 治疗方案和医嘱建议通常由医生填写，但用户也可以备注 -->
          <el-form-item label="当前方案" prop="currentPlan">
          <el-input v-model="editForm.currentPlan" type="textarea" :rows="2" placeholder="正在进行的治疗或用药情况（审核必填）" />
        </el-form-item>
        
          <el-form-item label="下一步建议" prop="nextStep">
          <el-input v-model="editForm.nextStep" type="textarea" :rows="2" placeholder="后续计划（复诊/检查等）（审核必填）" />
        </el-form-item>

      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="editLoading" @click="saveProfile">提交审核</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick, watch } from 'vue'
import { Refresh, Close, User, TrendCharts } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance } from 'element-plus'
import { getMedicalRecordsByUserId, getMedicalRecordDetail } from '@/api/modules/medicalRecord'
import { getPatientProfileByUserId, savePatientProfile } from '@/api/modules/patient'
import { useUserStore } from '@/stores/user'
import * as echarts from 'echarts'

const store = useUserStore()
const loading = ref(false)
const list = ref<any[]>([])
const total = ref(0)
const dateRange = ref('')
const status = ref<number | null>(null)

// 健康档案数据
const healthProfile = ref<any>(null)

// 编辑档案相关
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive({
  idCard: '',
  bloodType: '',
  allergyHistory: '',
  chronicDisease: '',
  currentSymptoms: '',
  currentPlan: '',
  nextStep: '',
  address: '',
  emergencyName: '',
  emergencyPhone: ''
})

const rules = {
  idCard: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '请输入正确的身份证号格式', trigger: 'blur' }
  ],
  bloodType: [
    { required: true, message: '请选择血型', trigger: 'change' }
  ],
  emergencyName: [
    { required: true, message: '请输入紧急联系人姓名', trigger: 'blur' }
  ],
  emergencyPhone: [
    { required: true, message: '请输入紧急联系人电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码格式', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入居住地址', trigger: 'blur' }
  ],
  currentSymptoms: [
    { required: true, message: '请输入当前症状', trigger: 'blur' }
  ],
  currentPlan: [
    { required: true, message: '请输入当前方案', trigger: 'blur' }
  ],
  nextStep: [
    { required: true, message: '请输入下一步建议', trigger: 'blur' }
  ]
}

// 详情抽屉
const drawerVisible = ref(false)
const currentRecord = ref<any>(null)

// 用户信息
const userAvatar = computed(() => store.userInfo?.avatarUrl || '')
const userName = computed(() => store.userInfo?.realName || store.userInfo?.username || '用户')
const userShort = computed(() => userName.value.charAt(0))

// 图表
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null

onMounted(() => {
  fetchList()
  fetchProfile()
})

async function fetchProfile() {
  if (!store.userInfo?.id) return
  try {
    const res = await getPatientProfileByUserId(store.userInfo.id)
    if (res.code === 200) {
      healthProfile.value = res.data
    }
  } catch (err) {
    console.error('获取健康档案失败', err)
  }
}

async function fetchList() {
  if (!store.userInfo?.id) return
  loading.value = true
  try {
    const res = await getMedicalRecordsByUserId(store.userInfo.id)
    if (res.code === 200) {
      list.value = res.data || []
      total.value = list.value.length
      initChart()
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取就诊记录失败')
  } finally {
    loading.value = false
  }
}

function initChart() {
  nextTick(() => {
    if (!chartRef.value) return
    if (chartInstance) chartInstance.dispose()
    
    chartInstance = echarts.init(chartRef.value)
    
    // 统计每月就诊次数
    const monthCounts: Record<string, number> = {}
    list.value.forEach(item => {
      if (item.visitDate) {
        const month = item.visitDate.substring(0, 7) // YYYY-MM
        monthCounts[month] = (monthCounts[month] || 0) + 1
      }
    })
    
    const months = Object.keys(monthCounts).sort()
    const counts = months.map(m => monthCounts[m])
    
    const option = {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: months },
      yAxis: { type: 'value', minInterval: 1 },
      series: [{
        data: counts,
        type: 'line',
        smooth: true,
        areaStyle: { opacity: 0.2 },
        itemStyle: { color: '#409eff' }
      }],
      grid: { top: 30, right: 20, bottom: 20, left: 30, containLabel: true }
    }
    
    chartInstance.setOption(option)
  })
}

// 监听窗口大小变化调整图表
window.addEventListener('resize', () => {
  chartInstance?.resize()
})

async function openCase(row: any) {
  try {
    const res = await getMedicalRecordDetail(row.id)
    if (res.code === 200) {
      currentRecord.value = res.data
      drawerVisible.value = true
    }
  } catch (error) {
    ElMessage.error('获取详情失败')
  }
}

function onDateChange() {
  // 简单的前端筛选实现
  fetchList().then(() => {
    if (dateRange.value) {
      const [start, end] = dateRange.value
      list.value = list.value.filter(item => {
        const date = item.visitDate.split(' ')[0]
        return date >= start && date <= end
      })
    }
  })
}

function getBloodTypeTag(type: string) {
  const map: Record<string, string> = {
    'A': '', 'B': 'success', 'AB': 'warning', 'O': 'danger', 'RH-': 'info'
  }
  return map[type] || 'info'
}

function statusType(status: number) {
  return status === 1 ? 'success' : (status === 2 ? 'info' : 'primary')
}

function statusText(status: number) {
  const map = { 0: '治疗中', 1: '已完成', 2: '已归档' }
  return map[status as keyof typeof map] || '未知'
}

function exportReport() {
  ElMessage.success('正在生成PDF报告，请稍候...')
  setTimeout(() => {
    window.print()
  }, 1000)
}

function openEditProfile() {
  if (healthProfile.value) {
    const rawIdCard = String(healthProfile.value.idCard || '')
    const rawEmergencyPhone = String(healthProfile.value.emergencyPhone || '')
    const idCardForEdit = rawIdCard.includes('*') ? '' : rawIdCard
    const emergencyPhoneForEdit = rawEmergencyPhone.includes('*') ? '' : rawEmergencyPhone

    Object.assign(editForm, {
      idCard: idCardForEdit,
      bloodType: healthProfile.value.bloodType || '',
      allergyHistory: healthProfile.value.allergyHistory || '',
      chronicDisease: healthProfile.value.chronicDisease || '',
      currentSymptoms: healthProfile.value.currentSymptoms || '',
      currentPlan: healthProfile.value.currentPlan || '',
      nextStep: healthProfile.value.nextStep || '',
      address: healthProfile.value.address || '',
      emergencyName: healthProfile.value.emergencyName || '',
      emergencyPhone: emergencyPhoneForEdit
    })
  } else {
    // 重置表单
    Object.keys(editForm).forEach(key => (editForm as any)[key] = '')
  }
  editDialogVisible.value = true
}

async function saveProfile() {
  if (!store.userInfo?.id) return
  if (!editFormRef.value) return
  
  await editFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      editLoading.value = true
      try {
        const res = await savePatientProfile(store.userInfo!.id, editForm)
        if (res.code === 200) {
          ElMessage.success('提交成功，等待审核')
          editDialogVisible.value = false
          fetchProfile() // 刷新数据
        } else {
          ElMessage.error(res.message || '保存失败')
        }
      } catch (error) {
        console.error(error)
        ElMessage.error('保存失败，请稍后重试')
      } finally {
        editLoading.value = false
      }
    } else {
      ElMessage.warning('请检查输入项是否正确')
      console.log('error submit!', fields)
    }
  })
}

function getVerifyText(v?: number) {
  if (v === 1) return '已通过'
  if (v === 2) return '审核中'
  return '未通过'
}

function getVerifyTagType(v?: number) {
  if (v === 1) return 'success'
  if (v === 2) return 'warning'
  return 'danger'
}
</script>

<style scoped>
.health-records-container {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 20px;
}

.dashboard-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.chart-container {
  height: 200px;
}

.report-list {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.report-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 6px;
  width: 280px;
}

.report-info {
  flex: 1;
  overflow: hidden;
}

.report-name {
  font-weight: 500;
  truncate: hidden;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.report-date {
  font-size: 12px;
  color: #999;
}

.timeline-card {
  cursor: pointer;
  transition: all 0.2s;
}

.timeline-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.timeline-header h4 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.timeline-doctor {
  font-size: 13px;
  color: #666;
  margin: 4px 0;
}

.timeline-desc {
  color: #888;
  font-size: 13px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

/* 抽屉样式 */
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #eee;
}

.dh-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.detail-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.header-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border: 1px solid #ebeef5;
}

.patient-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.patient-info .name {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 12px;
}

.info-item.full {
  grid-column: span 2;
}

.info-item .label {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.info-item .value {
  font-size: 14px;
  color: #334155;
  font-weight: 500;
}

.highlight {
  color: #0ea5e9;
  font-weight: 600;
}
</style>
