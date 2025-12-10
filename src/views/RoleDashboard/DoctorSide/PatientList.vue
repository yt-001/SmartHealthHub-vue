<template>
  <div class="patient-detail-page">
    <el-row :gutter="20">
      <!-- 顶部：左侧患者基本信息、右侧历史病历 -->
      <el-col :span="12">
        <el-card shadow="hover" class="mb-4">
          <template #header>
            <div class="card-header">
              <span>患者基本信息</span>
            </div>
          </template>
          <div v-loading="loadingPatient">
            <div v-if="patientInfo" class="info-list">
              <div class="info-item"><span class="label">姓名：</span><span class="value font-bold">{{ patientInfo.realName }}</span></div>
              <div class="info-item"><span class="label">性别：</span><span class="value">{{ formatGender(patientInfo.gender) }}</span></div>
              <div class="info-item"><span class="label">手机号：</span><span class="value">{{ patientInfo.phone }}</span></div>
              <div class="info-item"><span class="label">出生日期：</span><span class="value">{{ patientInfo.birthDate || '未填写' }}</span></div>
              <div class="info-item"><span class="label">身份证号：</span><span class="value">{{ patientInfo.idCard || '未填写' }}</span></div>
            </div>
            <el-empty v-else description="暂无患者信息" />
          </div>
        </el-card>
      </el-col>

      <el-col :span="12">
        <el-card shadow="hover" class="mb-4">
          <template #header>
            <div class="card-header">
              <span>历史病历记录</span>
              <el-tag v-if="currentAppointment" :type="getAppointmentStatusType(currentAppointment.status)">
                当前预约：{{ getAppointmentStatusLabel(currentAppointment.status) }}
              </el-tag>
            </div>
          </template>
          <div v-loading="loadingRecords">
            <el-timeline v-if="medicalRecords.length > 0">
              <el-timeline-item
                v-for="record in medicalRecords"
                :key="record.id"
                :timestamp="record.visitDate || record.completedDate"
                placement="top"
                type="primary"
              >
                <el-card class="record-item-card">
                  <h4>{{ record.diagnosis || '未诊断' }}</h4>
                  <p v-if="record.symptoms"><strong>主诉：</strong>{{ record.symptoms }}</p>
                  <p v-if="record.treatmentPlan"><strong>治疗方案：</strong>{{ record.treatmentPlan }}</p>
                  <p v-if="record.prescription"><strong>处方/建议：</strong>{{ record.prescription }}</p>
                  <p class="text-gray-400 text-sm mt-2">医生：{{ record.doctorName }}</p>
                </el-card>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无历史病历" />
          </div>
        </el-card>
      </el-col>

      <!-- 底部：健康档案（占满一行） -->
      <el-col :span="24">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>健康档案</span>
              <div v-if="currentAppointment && (currentAppointment.status === 0 || currentAppointment.status === 1)">
                <el-button type="primary" size="small" @click="openDiagnosisDialog">开始就诊 / 填写病历</el-button>
              </div>
            </div>
          </template>
          <div v-loading="loadingProfile">
            <div v-if="patientProfile" class="info-list">
              <div class="info-item"><span class="label">血型：</span><span class="value">{{ patientProfile.bloodType || '未知' }}</span></div>
              <div class="info-item"><span class="label">过敏史：</span><el-tag type="danger" v-if="patientProfile.allergyHistory">{{ patientProfile.allergyHistory }}</el-tag><span v-else class="value">无</span></div>
              <div class="info-item"><span class="label">慢性病史：</span><span class="value">{{ patientProfile.chronicDisease || '无' }}</span></div>
              <div class="info-item"><span class="label">紧急联系人：</span><span class="value">{{ patientProfile.emergencyName || '未填写' }} ({{ patientProfile.emergencyPhone || '-' }})</span></div>
            </div>
            <el-empty v-else description="暂无健康档案" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 就诊/写病历弹窗 -->
    <el-dialog
      v-model="diagnosisVisible"
      title="填写病历 & 完成就诊"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="diagnosisForm" label-width="80px">
        <el-form-item label="主诉">
          <el-input v-model="diagnosisForm.symptoms" type="textarea" :rows="2" placeholder="患者主要症状描述" />
        </el-form-item>
        <el-form-item label="诊断">
          <el-input v-model="diagnosisForm.diagnosis" placeholder="医生诊断结果" />
        </el-form-item>
        <el-form-item label="治疗方案">
          <el-input v-model="diagnosisForm.treatmentPlan" type="textarea" :rows="3" placeholder="治疗措施、用药建议等" />
        </el-form-item>
        <el-form-item label="处方/备注">
          <el-input v-model="diagnosisForm.prescription" type="textarea" :rows="2" placeholder="详细处方或医嘱备注" />
        </el-form-item>
        <el-form-item label="健康指标">
           <el-input v-model="diagnosisForm.notes" placeholder="如：血压 120/80, 血糖 5.6" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="diagnosisVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitDiagnosis">确认就诊并归档</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAppointmentDetail, updateAppointmentStatus, type AppointmentItem } from '@/api/modules/appointment'
import { fetchPatientAuthDetail, getPatientById } from '@/api/modules/patient'
import { getMedicalRecordsByUserId, createMedicalRecord, type medicalRecordApi } from '@/api/modules/medicalRecord'
import type { PatientAuthenticationDTO, PatientItem } from '@/api/types/patientTypes'
import { useUserStore } from '@/stores/user'
import { MedicalRecordItem } from '@/api/types/medicalRecordTypes'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const patientId = ref<string>('')
const appointmentId = ref<string>('')

// 数据状态
const loadingPatient = ref(false)
const loadingProfile = ref(false)
const loadingRecords = ref(false)
const patientInfo = ref<PatientItem | null>(null)
const patientProfile = ref<PatientAuthenticationDTO | null>(null)
const currentAppointment = ref<AppointmentItem | null>(null)
const medicalRecords = ref<MedicalRecordItem[]>([])

// 弹窗状态
const diagnosisVisible = ref(false)
const submitting = ref(false)
const diagnosisForm = ref({
  symptoms: '',
  diagnosis: '',
  treatmentPlan: '',
  prescription: '',
  notes: ''
})

onMounted(() => {
  initData()
})

watch(() => route.query, () => {
  initData()
})

const initData = async () => {
  const pId = route.query.patientId as string
  const aId = route.query.appointmentId as string
  const autoDiagnose = route.query.autoDiagnose as string
  
  if (pId) {
    patientId.value = pId
    fetchPatientInfo(pId)
    fetchPatientProfile(pId)
    fetchMedicalRecords(pId)
  }
  
  if (aId) {
    appointmentId.value = aId
    fetchAppointment(aId)
  }

  if (autoDiagnose === 'true') {
    openDiagnosisDialog()
  }
}

// 获取预约详情
const fetchAppointment = async (id: string) => {
  try {
    const res = await getAppointmentDetail(String(id))
    if (res.code === 200) {
      currentAppointment.value = res.data
      // 预填主诉
      if (currentAppointment.value?.description) {
        diagnosisForm.value.symptoms = currentAppointment.value.description
      }
    }
  } catch (e) {
    console.error(e)
  }
}

// 获取患者基本信息
const fetchPatientInfo = async (id: string) => {
  loadingPatient.value = true
  try {
    const res = await getPatientById(id)
    if (res.code === 200 && res.data) {
      patientInfo.value = res.data
    } else {
       // 降级：如果 appointment 里有，先用 appointment 的
       if (currentAppointment.value) {
        patientInfo.value = {
          id: id,
          realName: currentAppointment.value.patientName || '未知',
          gender: (currentAppointment.value.patientGender || 'O') as any,
          // 其他字段缺省
        } as any
      }
    }
  } catch (e) {
    console.error(e)
  } finally {
    loadingPatient.value = false
  }
}

const fetchPatientProfile = async (id: string) => {
  loadingProfile.value = true
  try {
    const res = await fetchPatientAuthDetail(id)
    if (res.code === 200) {
      patientProfile.value = res.data
      // 如果 DTO 里有 realName 等，也可以补充到 info
    }
  } catch (e) {
    console.error(e)
  } finally {
    loadingProfile.value = false
  }
}

const fetchMedicalRecords = async (id: string) => {
  loadingRecords.value = true
  try {
    const res = await getMedicalRecordsByUserId(String(id))
    if (res.code === 200) {
      medicalRecords.value = res.data || []
    }
  } catch (e) {
    console.error(e)
  } finally {
    loadingRecords.value = false
  }
}

// 辅助函数
const formatGender = (g: string) => {
  if (g === 'M' || g === '男') return '男'
  if (g === 'F' || g === '女') return '女'
  return '未知'
}
const formatShift = (s?: string) => {
  if (s === '1' || s === 'M') return '上午'
  if (s === '2' || s === 'A') return '下午'
  return s
}
const getAppointmentStatusLabel = (s: number) => {
  switch(s) {
    case 0: return '待确认'
    case 1: return '已确认'
    case 2: return '已就诊'
    case 3: return '已取消'
    default: return '未知'
  }
}
const getAppointmentStatusType = (s: number) => {
  switch(s) {
    case 0: return 'warning'
    case 1: return 'primary'
    case 2: return 'success'
    case 3: return 'info'
    default: return 'info'
  }
}

// 打开诊断弹窗
const openDiagnosisDialog = () => {
  diagnosisVisible.value = true
}

// 提交诊断
const submitDiagnosis = async () => {
  if (!userStore.userInfo?.id) {
    ElMessage.error('医生信息获取失败')
    return
  }
  
  submitting.value = true
  try {
    // 1. 创建病历
    const recordData = {
      userId: String(patientId.value),
      doctorId: String(userStore.userInfo.id),
      appointmentId: appointmentId.value ? String(appointmentId.value) : undefined,
      visitDate: new Date().toISOString().split('T')[0],
      ...diagnosisForm.value,
      status: 1 // 已完成
    }
    
    await createMedicalRecord(recordData)
    
    // 2. 更新预约状态为已就诊 (2)
    if (appointmentId.value) {
      await updateAppointmentStatus(String(appointmentId.value), 2)
    }
    
    ElMessage.success('就诊完成，病历已归档')
    diagnosisVisible.value = false
    
    // 刷新数据
    fetchMedicalRecords(patientId.value)
    if (appointmentId.value) fetchAppointment(appointmentId.value)
    
  } catch (error) {
    console.error(error)
    ElMessage.error('操作失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.patient-detail-page {
  padding: 20px;
}
.card-header {
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.info-item {
  margin-bottom: 12px;
  display: flex;
}
.label {
  color: #666;
  width: 90px;
  flex-shrink: 0;
}
.value {
  color: #333;
}
.record-item-card {
  margin-bottom: 10px;
}
.appointment-content {
  padding: 10px 0;
}
</style>
