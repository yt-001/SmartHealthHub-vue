<template>
  <!-- 医生详情弹窗（中文注释） -->
  <el-dialog
    v-model="visible"
    title="医生详情"
    width="600px"
    destroy-on-close
    @close="handleClose"
  >
    <div v-loading="loading" class="detail-container">
      <template v-if="doctorDetail">
        <!-- 头部信息卡片 -->
        <div class="header-card">
          <div class="avatar-section">
            <div class="avatar-circle">{{ getNameInitial(doctorDetail.realName) }}</div>
          </div>
          <div class="basic-info">
            <h2 class="name">{{ doctorDetail.realName || '-' }}</h2>
            <div class="tags">
              <el-tag v-if="doctorDetail.title" type="primary" effect="plain">{{ doctorDetail.title }}</el-tag>
              <el-tag :type="statusInfo(doctorDetail.status).type">{{ statusInfo(doctorDetail.status).text }}</el-tag>
            </div>
          </div>
        </div>

        <!-- 详细信息列表 -->
        <el-descriptions :column="2" border class="detail-descriptions">
          <el-descriptions-item label="医生ID">{{ doctorDetail.id || '-' }}</el-descriptions-item>
          <el-descriptions-item label="用户ID">{{ doctorDetail.userId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="登录账号">{{ doctorDetail.username || '-' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ doctorDetail.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱" :span="2">{{ doctorDetail.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="科室ID">{{ doctorDetail.deptId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="科室名称">{{ doctorDetail.deptName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="执业证书编号" :span="2">{{ doctorDetail.qualificationNo || '-' }}</el-descriptions-item>
          <el-descriptions-item label="擅长领域" :span="2">{{ doctorDetail.specialty || '-' }}</el-descriptions-item>
          <el-descriptions-item label="个人简介" :span="2">{{ doctorDetail.bio || '-' }}</el-descriptions-item>
          <el-descriptions-item label="工作班次">{{ doctorDetail.workShift || '-' }}</el-descriptions-item>
          <el-descriptions-item label="诊室编号">{{ doctorDetail.officeRoom || '-' }}</el-descriptions-item>
          <el-descriptions-item label="认证状态">
            <el-tag :type="verifyStatusInfo(doctorDetail.qualificationVerified).type">
              {{ verifyStatusInfo(doctorDetail.qualificationVerified).text }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatTime(doctorDetail.createdAt) }}</el-descriptions-item>
        </el-descriptions>
      </template>

      <el-empty v-else-if="!loading" description="暂无数据" />
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { doctorApi } from '@/api'
import type { DoctorProfilesVO } from '@/api/types/doctorTypes'

interface Props {
  modelValue: boolean
  doctorId?: string | number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const doctorDetail = ref<(DoctorProfilesVO & { id?: string; userId?: string; username?: string; realName?: string; phone?: string; email?: string; status?: number }) | null>(null)

// 监听 doctorId 变化，加载详情数据
watch(
  () => props.doctorId,
  async (newId) => {
    if (newId && visible.value) {
      await fetchDoctorDetail(newId)
    }
  },
  { immediate: true }
)

// 监听弹窗打开
watch(visible, async (val) => {
  if (val && props.doctorId) {
    await fetchDoctorDetail(props.doctorId)
  } else if (!val) {
    doctorDetail.value = null
  }
})

const fetchDoctorDetail = async (id: string | number) => {
  loading.value = true
  try {
    const res = await doctorApi.getDoctorProfileId(id)
    if (res.code === 200 && res.data) {
      doctorDetail.value = res.data as any
    }
  } catch (e) {
    console.error('获取医生详情失败:', e)
    doctorDetail.value = null
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  visible.value = false
}

const formatTime = (val: string | undefined) => {
  if (!val) return '-'
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(val)) return val
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(val)) {
    return val.replace('T', ' ').slice(0, 19)
  }
  return val
}

const statusInfo = (s?: number) => {
  switch (s) {
    case 0: return { text: '正常', type: 'success' as const }
    case 1: return { text: '锁定', type: 'warning' as const }
    case 2: return { text: '未激活', type: 'info' as const }
    case 3: return { text: '已注销', type: 'danger' as const }
    default: return { text: '-', type: 'info' as const }
  }
}

const verifyStatusInfo = (s?: number) => {
  switch (s) {
    case 0: return { text: '未通过', type: 'danger' as const }
    case 1: return { text: '已通过', type: 'success' as const }
    case 2: return { text: '审核中', type: 'warning' as const }
    default: return { text: '-', type: 'info' as const }
  }
}

const getNameInitial = (name: string = '') => {
  if (!name) return '医'
  return name.trim().charAt(0)
}
</script>

<style scoped>
.detail-container {
  min-height: 200px;
}

.header-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-radius: 12px;
  margin-bottom: 20px;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #059669, #10b981);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.basic-info {
  flex: 1;
}

.name {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 10px 0;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.detail-descriptions {
  margin-top: 16px;
}

.detail-descriptions :deep(.el-descriptions__label) {
  width: 120px;
  font-weight: 500;
}
</style>
