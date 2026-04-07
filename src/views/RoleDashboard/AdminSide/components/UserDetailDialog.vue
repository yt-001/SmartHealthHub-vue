<template>
  <!-- 用户详情弹窗（中文注释） -->
  <el-dialog
    v-model="visible"
    title="用户详情"
    width="600px"
    destroy-on-close
    @close="handleClose"
  >
    <div v-loading="loading" class="detail-container">
      <template v-if="userDetail">
        <!-- 头部信息卡片 -->
        <div class="header-card">
          <div class="avatar-section">
            <el-avatar :size="80" :src="userDetail.avatarUrl">
              {{ getNameInitial(userDetail.realName || userDetail.username) }}
            </el-avatar>
          </div>
          <div class="basic-info">
            <h2 class="name">{{ userDetail.realName || '-' }}</h2>
            <div class="tags">
              <el-tag :type="roleInfo(userDetail.role).type">{{ roleInfo(userDetail.role).text }}</el-tag>
              <el-tag :type="statusInfo(userDetail.status).type">{{ statusInfo(userDetail.status).text }}</el-tag>
            </div>
            <div class="username">@{{ userDetail.username || '-' }}</div>
          </div>
        </div>

        <!-- 详细信息列表 -->
        <el-descriptions :column="2" border class="detail-descriptions">
          <el-descriptions-item label="用户ID">{{ userDetail.id || '-' }}</el-descriptions-item>
          <el-descriptions-item label="登录账号">{{ userDetail.username || '-' }}</el-descriptions-item>
          <el-descriptions-item label="真实姓名">{{ userDetail.realName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ userDetail.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱" :span="2">{{ userDetail.email || '-' }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ genderText(userDetail.gender) }}</el-descriptions-item>
          <el-descriptions-item label="出生日期">{{ userDetail.birthDate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="角色">
            <el-tag :type="roleInfo(userDetail.role).type">{{ roleInfo(userDetail.role).text }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusInfo(userDetail.status).type">{{ statusInfo(userDetail.status).text }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ formatTime(userDetail.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间" :span="2">{{ formatTime(userDetail.updatedAt) }}</el-descriptions-item>
        </el-descriptions>

        <!-- 如果是患者，显示患者档案信息 -->
        <template v-if="userDetail.role === 2 && patientProfile">
          <el-divider content-position="left">患者档案</el-divider>
          <el-descriptions :column="2" border class="detail-descriptions">
            <el-descriptions-item label="身份证号">{{ patientProfile.idCard || '-' }}</el-descriptions-item>
            <el-descriptions-item label="血型">{{ patientProfile.bloodType || '-' }}</el-descriptions-item>
            <el-descriptions-item label="过敏史" :span="2">{{ patientProfile.allergyHistory || '-' }}</el-descriptions-item>
            <el-descriptions-item label="慢性病史" :span="2">{{ patientProfile.chronicDisease || '-' }}</el-descriptions-item>
            <el-descriptions-item label="地址" :span="2">{{ patientProfile.address || '-' }}</el-descriptions-item>
            <el-descriptions-item label="紧急联系人">{{ patientProfile.emergencyName || '-' }}</el-descriptions-item>
            <el-descriptions-item label="紧急联系电话">{{ patientProfile.emergencyPhone || '-' }}</el-descriptions-item>
          </el-descriptions>
        </template>
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
import { userApi } from '@/api'

interface Props {
  modelValue: boolean
  userId?: string | number
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
const userDetail = ref<any>(null)
const patientProfile = ref<any>(null)

// 监听 userId 变化，加载详情数据
watch(
  () => props.userId,
  async (newId) => {
    if (newId && visible.value) {
      await fetchUserDetail(newId)
    }
  },
  { immediate: true }
)

// 监听弹窗打开
watch(visible, async (val) => {
  if (val && props.userId) {
    await fetchUserDetail(props.userId)
  } else if (!val) {
    userDetail.value = null
    patientProfile.value = null
  }
})

const fetchUserDetail = async (id: string | number) => {
  loading.value = true
  try {
    const res = await userApi.getUserById(id)
    if (res.code === 200 && res.data) {
      userDetail.value = res.data
    }
  } catch (e) {
    console.error('获取用户详情失败:', e)
    userDetail.value = null
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

const roleInfo = (r?: number) => {
  switch (r) {
    case 0: return { text: '管理员', type: 'danger' as const }
    case 1: return { text: '医生', type: 'primary' as const }
    case 2: return { text: '患者', type: 'success' as const }
    default: return { text: '-', type: 'info' as const }
  }
}

const genderText = (g?: string) => {
  switch (g) {
    case 'M': return '男'
    case 'F': return '女'
    case 'O': return '其他'
    default: return '-'
  }
}

const getNameInitial = (name: string = '') => {
  if (!name) return '?'
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
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-radius: 12px;
  margin-bottom: 20px;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-section :deep(.el-avatar) {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  font-size: 28px;
  font-weight: 700;
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
  margin-bottom: 8px;
}

.username {
  font-size: 14px;
  color: #6b7280;
}

.detail-descriptions {
  margin-top: 16px;
}

.detail-descriptions :deep(.el-descriptions__label) {
  width: 120px;
  font-weight: 500;
}

.el-divider {
  margin: 24px 0 16px;
}
</style>
