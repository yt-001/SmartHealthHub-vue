<template>
  <div class="user-center">
    <!-- 顶部：头像、昵称与背景图 -->
    <div class="uc-hero">
      <div class="bg-overlay"></div>
      <div class="hero-content">
        <div class="user-info-block">
          <el-avatar :size="80" :src="avatarUrl" class="hero-avatar">
            {{ nicknameShort }}
          </el-avatar>
          <div class="hero-text">
            <h1 class="name">{{ nickname }}</h1>
            <p class="sub">欢迎来到您的个人健康中心</p>
          </div>
        </div>
        <!-- 顶部额外装饰或统计（可选） -->
      </div>
    </div>

    <div class="uc-container">
      <!-- 左侧：导航 -->
      <aside class="uc-sidebar">
        <div class="nav-card">
          <el-menu
            :default-active="activeKey"
            @select="onSelect"
            class="uc-menu"
            :collapse="false"
          >
            <el-menu-item index="profile">
              <el-icon><UserFilled /></el-icon>
              <span>基本信息</span>
            </el-menu-item>
            <el-menu-item index="records">
              <el-icon><Document /></el-icon>
              <span>我的病例</span>
            </el-menu-item>
            <el-menu-item index="appointments">
              <el-icon><Calendar /></el-icon>
              <span>我的预约</span>
            </el-menu-item>
            <el-menu-item index="settings">
              <el-icon><Setting /></el-icon>
              <span>设置</span>
            </el-menu-item>
          </el-menu>
        </div>
      </aside>

      <!-- 右侧：内容展示区 -->
      <main class="uc-main">
        <div class="content-card">
          <transition name="fade-slide" mode="out-in">
            <component :is="currentView" />
          </transition>
        </div>
      </main>
    </div>

    <!-- 悬浮操作按钮组 (仅在我的病例页面显示) -->
    <transition name="fade">
      <div v-if="showFloatingButtons" class="floating-actions">
        <el-tooltip content="预约挂号" placement="left">
          <el-button type="primary" circle size="large" class="float-btn second-btn" @click="openAppointmentDialog">
            <el-icon><Calendar /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip content="上传健康档案" placement="left">
          <el-button type="success" circle size="large" class="float-btn second-btn" @click="openUploadDialog">
            <el-icon><UploadFilled /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </transition>

    <!-- 预约挂号弹窗：第一步 - 选择日期 -->
    <el-dialog v-model="appointmentVisible" title="预约挂号 - 选择日期" width="850px" append-to-body destroy-on-close>
      <div class="appointment-calendar-container">
        <ScheduleCalendar :shrunk="true" @date-select="handleDateSelect" />
      </div>
    </el-dialog>

    <!-- 预约挂号弹窗：第二步 - 选择医生 -->
    <el-dialog v-model="dayScheduleVisible" :title="`预约挂号 - ${selectedDate} 医生列表`" width="600px" append-to-body>
      <div v-if="currentDaySchedules.length === 0" class="empty-schedule">
        <el-empty description="该日期暂无医生排班" />
      </div>
      <div v-else class="doctor-list">
        <div 
          v-for="schedule in currentDaySchedules" 
          :key="schedule.id" 
          class="doctor-card"
          @click="handleDoctorSelect(schedule)"
        >
          <div class="doctor-info">
            <span class="doctor-name">{{ schedule.doctorName }}</span>
            <el-tag size="small" effect="plain" v-if="schedule.title">{{ schedule.title }}</el-tag>
            <span class="dept-name">{{ schedule.deptName }}</span>
          </div>
          <div class="shift-info">
            <el-tag size="small" :type="shiftTagTypeMap[schedule.shiftCode]">
              {{ shiftCodeMap[schedule.shiftCode] }}
            </el-tag>
            <span class="room-no" v-if="schedule.roomNo">{{ schedule.roomNo }}诊室</span>
          </div>
          <div class="appoint-status">
            <span>余号: {{ schedule.maxAppoint - (schedule.appointedCount || 0) }}</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 预约挂号弹窗：第三步 - 确认预约 -->
    <el-dialog v-model="doctorDetailVisible" title="预约确认" width="500px" append-to-body>
      <div v-if="selectedDoctorSchedule" class="confirm-appoint">
        <div class="confirm-row">
          <span class="label">就诊医生：</span>
          <span class="value">
            {{ selectedDoctorSchedule.doctorName }}
            <span class="sub-text" v-if="selectedDoctorSchedule.title">({{ selectedDoctorSchedule.title }})</span>
          </span>
        </div>
        <div class="confirm-row">
          <span class="label">就诊科室：</span>
          <span class="value">{{ selectedDoctorSchedule.deptName }}</span>
        </div>
        <div class="confirm-row">
          <span class="label">就诊时间：</span>
          <span class="value">{{ selectedDate }} {{ shiftCodeMap[selectedDoctorSchedule.shiftCode] }}</span>
        </div>
        <div class="confirm-row">
          <span class="label">就诊诊室：</span>
          <span class="value">{{ selectedDoctorSchedule.roomNo || '待定' }}</span>
        </div>
        
        <el-form class="mt-4">
          <el-form-item label="病情描述">
            <el-input 
              v-model="appointmentDescription" 
              type="textarea" 
              rows="3" 
              placeholder="请简要描述您的症状（选填）" 
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="doctorDetailVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="confirmAppointment">确认预约</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 上传档案弹窗 -->
    <el-dialog v-model="uploadVisible" title="上传健康档案" width="500px" append-to-body>
      <el-form :model="uploadForm" label-width="80px">
        <el-form-item label="档案文件" required>
          <el-upload
            class="upload-demo"
            action="#"
            :auto-upload="false"
            :limit="1"
            :on-change="handleFileChange"
          >
            <el-button type="primary">点击选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">只能上传 jpg/png/pdf 文件，且不超过 5MB</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="档案描述">
          <el-input v-model="uploadForm.description" type="textarea" rows="3" placeholder="请输入档案描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="uploadVisible = false">取消</el-button>
          <el-button type="success" @click="submitUpload">确认上传</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent, reactive } from 'vue'
import { UserFilled, Document, Setting, Calendar, UploadFilled } from '@element-plus/icons-vue'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import { createAppointment } from '@/api/modules/appointment'
import type { DoctorScheduleItem } from '@/api/types/scheduleTypes'
import ScheduleCalendar from '../RoleDashboard/ScheduleCalendar.vue'

// 子视图组件懒加载
const ProfileView = defineAsyncComponent({ loader: () => import('../ClientSide/UserCenterParts/ProfileView.vue'), suspensible: false })
const MedicalRecordsList = defineAsyncComponent({ loader: () => import('../ClientSide/MedicalRecordsList.vue'), suspensible: false })
const MyAppointmentsView = defineAsyncComponent({ loader: () => import('../ClientSide/UserCenterParts/MyAppointmentsView.vue'), suspensible: false })
const SettingsView = defineAsyncComponent({ loader: () => import('../ClientSide/UserCenterParts/SettingsView.vue'), suspensible: false })

const store = useUserStore()
const activeKey = ref<'profile' | 'records' | 'appointments' | 'settings'>('profile')

/** 获取昵称（带兜底） */
const nickname = computed(() => (store.userInfo?.realName || store.userInfo?.username || '未登录'))
/** 获取头像地址 */
const avatarUrl = computed(() => store.userInfo?.avatarUrl || '')
/** 获取昵称首字母 */
const nicknameShort = computed(() => String(nickname.value || '?').slice(0, 1))

/** 控制悬浮按钮显示：仅在“我的病例”页面显示 */
const showFloatingButtons = computed(() => activeKey.value === 'records')

// --- 预约挂号相关 ---
/** 班次中文映射 */
const shiftCodeMap: Record<'AM' | 'PM' | 'FULL', string> = {
  AM: '上午',
  PM: '下午',
  FULL: '全天'
}
/** 班次标签类型映射 */
const shiftTagTypeMap: Record<'AM' | 'PM' | 'FULL', string> = {
  AM: 'warning',
  PM: 'success',
  FULL: 'info'
}
const appointmentVisible = ref(false)
const dayScheduleVisible = ref(false)
const doctorDetailVisible = ref(false)

const selectedDate = ref('')
const currentDaySchedules = ref<DoctorScheduleItem[]>([])
const selectedDoctorSchedule = ref<DoctorScheduleItem | null>(null)
const appointmentDescription = ref('')
const submitting = ref(false)

/** 打开预约挂号第一步弹窗 */
function openAppointmentDialog() {
  appointmentVisible.value = true
}

/** 处理日历选择的日期与当日排班 */
function handleDateSelect(dateStr: string, schedules: DoctorScheduleItem[]) {
  selectedDate.value = dateStr
  currentDaySchedules.value = schedules
  dayScheduleVisible.value = true
}

/** 选择具体医生排班并进入确认页 */
function handleDoctorSelect(schedule: DoctorScheduleItem) {
  selectedDoctorSchedule.value = schedule
  appointmentDescription.value = ''
  doctorDetailVisible.value = true
}

/** 提交预约申请到后端 */
async function confirmAppointment() {
  if (!selectedDoctorSchedule.value) return
  if (!store.userInfo?.id) {
    ElMessage.error('请先登录')
    return
  }

  submitting.value = true
  try {
    const res = await createAppointment({
      scheduleId: String(selectedDoctorSchedule.value.id),
      patientId: String(store.userInfo.id),
      description: appointmentDescription.value
    })
    
    if (res.code === 200) {
      ElMessage.success('预约申请已提交成功！')
      // 关闭所有弹窗
      doctorDetailVisible.value = false
      dayScheduleVisible.value = false
      appointmentVisible.value = false
      // 通知“我的预约”页面刷新列表
      window.dispatchEvent(new CustomEvent('appointments:refresh'))
    } else {
      ElMessage.error(res.msg || '预约失败，请稍后重试')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('预约请求发生错误')
  } finally {
    submitting.value = false
  }
}

// --- 上传档案相关 ---
const uploadVisible = ref(false)
const uploadForm = reactive({
  file: null as File | null,
  description: ''
})
function openUploadDialog() {
  uploadForm.file = null
  uploadForm.description = ''
  uploadVisible.value = true
}
function handleFileChange(file: any) {
  uploadForm.file = file.raw
}
async function submitUpload() {
  if (!uploadForm.file) {
    ElMessage.warning('请选择文件')
    return
  }
  // 模拟上传
  await new Promise(resolve => setTimeout(resolve, 800))
  ElMessage.success('档案上传成功')
  uploadVisible.value = false
}

/** 处理导航选择 */
function onSelect(key: string) {
  activeKey.value = key as any
}

/** 当前视图组件 */
const currentView = computed(() => {
  if (activeKey.value === 'profile') return ProfileView
  if (activeKey.value === 'records') return MedicalRecordsList
  if (activeKey.value === 'appointments') return MyAppointmentsView
  return SettingsView
})
</script>

<style scoped>
/* 页面整体布局 */
.user-center {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  background-color: #f0f2f5;
}

/* 顶部 Hero 区域 */
.uc-hero {
  position: relative;
  height: 240px;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
  margin-bottom: -60px; /* 让内容卡片上浮覆盖 */
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: url('/src/assets/PersonalHome-Page.png') center/cover no-repeat;
  opacity: 0.15;
  mix-blend-mode: overlay;
}

.hero-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1200px;
  padding: 0 24px;
  display: flex;
  align-items: flex-start; /* 头像上浮对齐调整 */
  height: 100%;
  padding-top: 40px;
}

.user-info-block {
  display: flex;
  align-items: center;
  gap: 20px;
}

.hero-avatar {
  border: 4px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  background-color: #fff;
  color: #409eff;
  font-size: 28px;
  font-weight: bold;
}

.hero-text .name {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.hero-text .sub {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin: 6px 0 0;
}

/* 主体容器 */
.uc-container {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px 20px;
  display: flex;
  gap: 24px;
  align-items: center; /* 垂直居中 */
  justify-content: center; /* 水平居中（如果内容宽度不足） */
  flex: 1;
  overflow: hidden; /* 内部滚动 */
}

/* 左侧导航栏 */
.uc-sidebar {
  width: 260px;
  flex-shrink: 0;
  max-height: 100%; /* 改为最大高度，配合居中 */
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
.uc-sidebar::-webkit-scrollbar {
  display: none;
}

/* ... (keeping intermediate styles if needed or just skipping to next match) ... */

.nav-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  overflow: hidden;
  padding: 8px 0;
}

.uc-menu {
  border-right: none;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  margin: 4px 12px;
  border-radius: 8px;
  color: #606266;
}

:deep(.el-menu-item.is-active) {
  background-color: #f0f9eb;
  color: #67c23a;
  font-weight: 600;
}

:deep(.el-menu-item:hover) {
  background-color: #f5f7fa;
}

/* 右侧内容区 */
.uc-main {
  flex: 1;
  min-width: 0; /* 防止 flex 子项溢出 */
  max-height: 100%; /* 改为最大高度 */
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 0; /* 移除底部 padding，避免滚动条计算问题 */
}
.uc-main::-webkit-scrollbar {
  display: none;
}

.content-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  padding: 32px;
  min-height: 600px;
}

/* 预约确认弹窗样式 */
.confirm-appoint {
  padding: 10px;
}
.confirm-row {
  display: flex;
  margin-bottom: 12px;
  font-size: 15px;
}
.confirm-row .label {
  width: 80px;
  color: #606266;
  font-weight: 500;
}
.confirm-row .value {
  flex: 1;
  color: #303133;
}
.sub-text {
  font-size: 0.9em;
  color: #909399;
  margin-left: 4px;
}

/* 悬浮按钮样式 */
.floating-actions {
  position: fixed;
  right: 40px;
  bottom: 100px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.float-btn {
  width: 56px;
  height: 56px;
  font-size: 24px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: transform 0.3s;
}

.float-btn:hover {
    transform: scale(1.1);
  }

.second-btn {
  margin-left: 12px;
}
  
  /* 按钮淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 过渡动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .uc-hero {
    height: 200px;
    margin-bottom: 0;
  }

  .hero-content {
    padding-top: 0;
    align-items: center;
  }
  
  .uc-container {
    flex-direction: column;
    padding: 20px 16px;
  }

  .uc-sidebar {
    width: 100%;
  }

  .nav-card {
    display: flex;
    overflow-x: auto;
    padding: 4px;
  }
  
  .uc-menu {
    display: flex;
    width: 100%;
  }
  
  :deep(.el-menu-item) {
    margin: 0 4px;
    padding: 0 16px;
    flex: 1;
    justify-content: center;
  }

  .content-card {
    padding: 20px;
    min-height: 400px;
  }
}

/* 预约弹窗相关样式 */
.appointment-calendar-container {
  min-height: 400px;
  /* 确保日历容器有足够高度 */
}

.doctor-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding: 4px;
}

.doctor-card {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
}

.doctor-card:hover {
  border-color: var(--el-color-primary);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.doctor-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.doctor-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.dept-name {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.shift-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.room-no {
  font-size: 12px;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  padding: 2px 6px;
  border-radius: 4px;
}

.appoint-status {
  font-size: 14px;
  color: var(--el-color-primary);
  font-weight: 500;
}

.empty-schedule {
  padding: 40px 0;
  text-align: center;
}

.confirm-appoint {
  padding: 10px 20px;
}

.confirm-row {
  display: flex;
  margin-bottom: 12px;
  font-size: 15px;
}

.confirm-row .label {
  color: var(--el-text-color-secondary);
  width: 100px;
}

.confirm-row .value {
  color: var(--el-text-color-primary);
  font-weight: 500;
  flex: 1;
}
</style>
