<template>
  <div class="team-page">
    <!-- 页面头部：英雄榜风格 -->
    <div class="hero-header">
      <h1 class="title">名医殿堂</h1>
      <p class="subtitle">每一位医生，都是守护生命的冠军</p>
      <div class="decoration-line"></div>
    </div>

    <!-- 医生展示列表：冠军卡片风格 -->
    <div class="champion-grid">
      <div 
        v-for="(doctor, index) in doctors" 
        :key="doctor.id" 
        class="champion-card"
        :style="{ '--delay': `${index * 0.1}s` }"
      >
        <!-- 卡片背景光效 -->
        <div class="card-glow"></div>
        
        <!-- 医生形象区（使用姓名首字作为头像占位） -->
        <div class="doctor-visual">
          <div class="image-wrapper">
            <div class="avatar-fallback">{{ (doctor.realName || '医').slice(0,1) }}</div>
          </div>
        </div>

        <!-- 信息展示区 -->
        <div class="doctor-info">
          <!-- 头部信息：名字与联系方式并排 -->
          <div class="info-header-new">
            <div class="name-block">
              <div class="name-line">
                <h2 class="name">{{ doctor.realName }}</h2>
                <span class="title-tag">{{ doctor.title }}</span>
              </div>
              <div class="account-line">账号：{{ doctor.username || '—' }}</div>
            </div>
            
            <div class="contact-block">
              <div class="contact-row">
                <el-icon class="icon"><Iphone /></el-icon>
                <span class="val">{{ doctor.phone || '—' }}</span>
              </div>
              <div class="contact-row">
                <el-icon class="icon"><Message /></el-icon>
                <span class="val" :title="doctor.email">{{ doctor.email ? (doctor.email.length > 18 ? doctor.email.slice(0,18)+'...' : doctor.email) : '—' }}</span>
              </div>
            </div>
          </div>

          <div class="divider"></div>

          <!-- 下方信息展示：预约状态与科室ID一排 -->
          <div class="info-grid-row">
            <div class="info-col">
              <span class="label">预约状态</span>
              <el-tag size="small" :type="getStatusTagType(doctor.status)">{{ getStatusLabel(doctor.status) }}</el-tag>
            </div>
            <div class="info-col">
              <span class="label">科室ID</span>
              <span class="value">{{ doctor.deptId }}</span>
            </div>
          </div>
          
          <!-- 执业证书单独一排 -->
          <div class="info-single-row">
             <span class="label">执业证书</span>
             <span class="value">{{ doctor.qualificationNo || '—' }}</span>
          </div>
          
          <!-- 交互按钮 -->
          <div class="action-row mt-4">
            <button class="book-btn" @click="handleBook(doctor)">
              <span>预约挂号</span>
              <el-icon><ArrowRight /></el-icon>
            </button>
            <button class="like-btn" @click="toggleLike(index)">
              <el-icon :class="{ 'is-liked': likedMap[doctor.id] }"><StarFilled /></el-icon>
            </button>
          </div>
        </div>
      </div>
    </div>

    

    <!-- 最终确认弹窗（如图样式） -->
    <el-dialog
      v-model="finalConfirmVisible"
      title="预约确认"
      width="520px"
      append-to-body
    >
      <div class="confirm-appoint">
        <div class="confirm-row">
          <span class="label">就诊医生：</span>
          <span class="value">{{ selectedShift?.doctorName }}（{{ selectedShift?.title || '医师' }}）</span>
        </div>
        <div class="confirm-row">
          <span class="label">就诊科室：</span>
          <span class="value">{{ selectedShift?.deptName }}</span>
        </div>
        <div class="confirm-row">
          <span class="label">就诊时间：</span>
          <span class="value">{{ selectedDate }} {{ selectedShift ? getShiftLabel(selectedShift.shiftCode) : '' }}</span>
        </div>
        <div class="confirm-row">
          <span class="label">就诊诊室：</span>
          <span class="value">{{ selectedShift?.roomNo || '待定' }}</span>
        </div>
        <div class="confirm-row">
          <span class="label">病情描述</span>
        </div>
        <el-input
          v-model="appointmentDescription"
          type="textarea"
          :rows="4"
          placeholder="请简要描述您的症状（选填）"
        />
      </div>
      <template #footer>
        <el-button @click="finalConfirmVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" :disabled="!selectedShift" @click="confirmAppointment(String(selectedShift!.id))">确认预约</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Trophy, ArrowRight, StarFilled, Iphone, Message } from '@element-plus/icons-vue'
import { createAppointment } from '@/api/modules/appointment'
import { fetchScheduleCalendarByRange } from '@/api/modules/schedule'
import type { DoctorScheduleItem } from '@/api/types/scheduleTypes'
import { getDoctorList } from '@/api/modules/doctor'
import type { DoctorItem } from '@/api/types/doctorTypes'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

/**
 * 医生团队展示页
 * @description 采用“冠军卡片”风格展示医生风采
 */

type TeamDoctor = DoctorItem & { username?: string }
// 真实医生数据（分页前6条）
const doctors = ref<TeamDoctor[]>([])
const loadingList = ref(false)

onMounted(async () => {
  try {
    loadingList.value = true
    const res: any = await getDoctorList({ pageNum: 1, pageSize: 6, status: 0 })
    const list = (res?.list ?? res?.data?.list ?? []) as TeamDoctor[]
    doctors.value = list.map(d => ({ ...d }))
  } catch (error) {
    console.error(error)
    ElMessage.error('医生列表加载失败')
  } finally {
    loadingList.value = false
  }
})

const likedMap = ref<Record<string, boolean>>({})
const toggleLike = (index: number) => {
  const id = doctors.value[index]?.id
  if (!id) return
  likedMap.value[id] = !likedMap.value[id]
}

// --- 预约相关逻辑 ---
const finalConfirmVisible = ref(false)
const selectedDoctorId = ref<number | undefined>(undefined)
const selectedDate = ref('')
const selectedShift = ref<DoctorScheduleItem | null>(null)
const appointmentDescription = ref('')
const submitting = ref(false)

// 班次映射
const shiftCodeMap: Record<string, string> = {
  'M': '上午',
  'A': '下午',
  'N': '晚上',
  'AM': '上午',
  'PM': '下午',
  'FULL': '全天'
}

/**
 * 获取班次中文标签
 * @param code 班次代码
 */
function getShiftLabel(code: string) {
  return shiftCodeMap[code] || code
}

// 账号状态映射
const statusLabelMap: Record<number, string> = {
  0: '正常',
  1: '锁定',
  2: '未激活',
  3: '已注销'
}
/**
 * 获取预约状态文案（沿用医生账号状态作为占位）
 * @param s 状态码
 */
function getStatusLabel(s: number) {
  return statusLabelMap[s] ?? '未知'
}
/**
 * 获取预约状态标签样式（沿用账号状态映射）
 * @param s 状态码
 */
function getStatusTagType(s: number) {
  switch (s) {
    case 0: return 'success'
    case 1: return 'warning'
    case 2: return 'info'
    case 3: return 'danger'
    default: return 'info'
  }
}

/**
 * 处理点击预约挂号：拉取近30天排班并进入最终确认弹窗
 */
async function handleBook(doctor: TeamDoctor) {
  if (!userStore.userInfo?.id) {
    ElMessage.warning('请先登录')
    return
  }
  
  selectedDoctorId.value = Number(doctor.id)

  try {
    const today = new Date()
    const startDate = formatDate(today)
    const endDate = formatDate(addDays(today, 30))

    const { data } = await fetchScheduleCalendarByRange({
      startDate,
      endDate,
      doctorId: doctor.id
    } as any)

    const list = data || []
    const pick = list.find(it => (it.maxAppoint - (it.bookedCount || 0)) > 0) || list[0]
    if (!pick) {
      ElMessage.info('该医生暂无可预约排班')
      return
    }

    selectedShift.value = pick
    selectedDate.value = pick.scheduleDate
    appointmentDescription.value = ''
    finalConfirmVisible.value = true
  } catch (error) {
    console.error(error)
    ElMessage.error('加载排班失败，请稍后重试')
  }
}

// 处理日历日期选择
/* 保留占位符以防未来扩展（当前不展示日历） */
function handleDateSelect() {}

/** 选择具体班次后，进入最终确认弹窗 */
/**
 * 选择具体班次后进入最终确认弹窗
 */
function openConfirm(shift: DoctorScheduleItem) {
  selectedShift.value = shift
  finalConfirmVisible.value = true
}

/**
 * 确认预约：提交预约申请并提示结果
 */
/**
 * 确认预约（使用字符串ID避免长整型精度丢失）
 */
async function confirmAppointment(scheduleId: string) {
  if (!userStore.userInfo?.id) return
  
  try {
    submitting.value = true
    const res = await createAppointment({
      scheduleId,
      patientId: String(userStore.userInfo.id),
      description: appointmentDescription.value
    })
    
    if (res.code === 200) {
      ElMessage.success('预约申请已提交成功！')
      finalConfirmVisible.value = false
      // 通知“我的预约”页面刷新列表
      window.dispatchEvent(new CustomEvent('appointments:refresh'))
    } else {
      ElMessage.error(res.msg || '预约失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('预约请求发生错误')
  } finally {
    submitting.value = false
  }
}

/**
 * 日期格式化（YYYY-MM-DD）
 */
function formatDate(dt: Date) {
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  const d = String(dt.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * 日期工具：在指定日期基础上增加天数
 */
function addDays(dt: Date, days: number) {
  const copy = new Date(dt)
  copy.setDate(copy.getDate() + days)
  return copy
}
</script>

<style scoped>
.team-page {
  padding: 40px 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
}

/* 头部样式 */
.hero-header {
  text-align: center;
  margin-bottom: 60px;
  position: relative;
}

.title {
  font-size: 48px;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary-color) 0%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 16px;
  letter-spacing: -1px;
}

.subtitle {
  font-size: 18px;
  color: var(--text-secondary);
  font-weight: 500;
}

.decoration-line {
  width: 60px;
  height: 4px;
  background: var(--primary-color);
  margin: 24px auto 0;
  border-radius: 2px;
  box-shadow: 0 2px 10px rgba(5, 150, 105, 0.3);
}

/* 冠军卡片网格 */
.champion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 40px;
  padding: 20px;
}

/* 卡片主体 */
.champion-card {
  position: relative;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 
    0 10px 30px -10px rgba(0, 0, 0, 0.05),
    0 0 0 1px rgba(255, 255, 255, 0.5) inset;
  backdrop-filter: blur(10px);
  
  /* 入场动画 */
  opacity: 0;
  animation: slideUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: var(--delay);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}

.champion-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: 
    0 20px 40px -12px rgba(5, 150, 105, 0.2),
    0 0 0 2px var(--primary-color) inset; /* 聚焦边框 */
}

/* 背景光效 */
.card-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(5, 150, 105, 0.05) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.4s;
  pointer-events: none;
  z-index: 0;
}
.champion-card:hover .card-glow {
  opacity: 1;
}

/* 医生形象区 */
.doctor-visual {
  position: relative;
  height: 320px;
  overflow: hidden;
  border-bottom: 1px solid rgba(0,0,0,0.03);
}

.image-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 96px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, var(--primary-color), #10b981);
}

/* 勋章 */
.badge-container {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 2;
}

.gold-medal {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #fff;
  padding: 6px 12px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
  transform: translateY(-10px);
  opacity: 0;
  animation: dropIn 0.5s 0.2s forwards;
}

@keyframes dropIn {
  to { transform: translateY(0); opacity: 1; }
}

/* 信息展示区 */
.doctor-info {
  padding: 24px;
  position: relative;
  z-index: 1;
}

.name-row {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 4px;
}

.name {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-main);
}

.title-tag {
  font-size: 13px;
  color: var(--primary-color);
  background: var(--primary-light-9);
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.department {
  color: var(--text-secondary);
  font-size: 14px;
  margin-bottom: 16px;
}

.divider {
  height: 1px;
  background: rgba(0,0,0,0.05);
  margin: 16px 0;
}

/* 头部信息布局 */
.info-header-new {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 8px;
}
.name-block {
  flex: 1;
}
.name-line {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}
.name {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-main);
}
.title-tag {
  font-size: 12px;
  color: var(--primary-color);
  background: var(--primary-light-9);
  padding: 1px 6px;
  border-radius: 4px;
  font-weight: 600;
  white-space: nowrap;
}
.account-line {
  font-size: 13px;
  color: var(--text-secondary);
}

.contact-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}
.contact-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--text-secondary);
}
.contact-row .icon {
  font-size: 14px;
}
.contact-row .val {
  font-family: Consolas, monospace;
  color: var(--text-main);
}

/* 下方信息展示 */
.info-grid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}
.info-col {
  display: flex;
  align-items: center;
  gap: 8px;
}
.info-col .label {
  color: var(--text-secondary);
  font-size: 13px;
}
.info-col .value {
  color: var(--text-main);
  font-size: 14px;
}

.info-single-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}
.info-single-row .label {
  color: var(--text-secondary);
  font-size: 13px;
}
.info-single-row .value {
  color: var(--text-main);
  font-size: 13px;
  font-family: Consolas, monospace;
}
.mt-4 {
  margin-top: 16px;
}

/* 交互按钮 */
.action-row {
  display: flex;
  gap: 12px;
}

.book-btn {
  flex: 1;
  border: none;
  background: var(--text-main);
  color: #fff;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.book-btn:hover {
  background: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(5, 150, 105, 0.3);
}

.like-btn {
  width: 48px;
  height: 48px;
  border: 1px solid var(--el-border-color-lighter);
  background: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 20px;
  color: var(--text-placeholder);
  transition: all 0.3s;
}

.like-btn:hover {
  border-color: #f59e0b;
  color: #f59e0b;
  background: #fffbeb;
}

.is-liked {
  color: #f59e0b;
}

/* 班次选择弹窗样式 */
.shift-selection {
  padding: 10px;
}

.hint-text {
  margin-bottom: 16px;
  color: #606266;
  font-weight: 500;
}

.shift-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.shift-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  background-color: #fff;
  transition: all 0.2s;
}

.shift-card:hover {
  border-color: var(--primary-color);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.shift-info {
  display: flex;
  gap: 16px;
  align-items: center;
}

.shift-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.room-info, .quota-info {
  font-size: 13px;
  color: #909399;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 4px;
}

.description-input .label {
  margin-bottom: 8px;
  color: #606266;
  font-weight: 500;
}

/* 预约确认弹窗样式（与个人中心一致） */
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
</style>
