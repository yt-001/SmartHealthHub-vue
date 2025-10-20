<template>
  <!-- 中文注释：排班日历页面 -->
  <div
    v-loading="isLoading"
    element-loading-text="正在加载排班数据..."
    class="schedule-page"
  >
    <!-- 顶部工具栏：月份切换与选择 -->
    <div class="toolbar">
      <el-button size="small" @click="goPrevMonth">上一月</el-button>
      <el-date-picker
        v-model="monthPicker"
        type="month"
        value-format="YYYY-MM"
        placeholder="选择月份"
        class="month-picker"
        @change="onMonthChange"
      />
      <el-button size="small" @click="goNextMonth">下一月</el-button>
      <el-button class="refresh-btn" size="small" type="primary" @click="reload">刷新排班</el-button>
      <el-button v-if="isAdmin" class="add-btn" size="small" type="success" @click="openAddDialog">添加排班表</el-button>
    </div>

    <!-- 日历主体 -->
    <el-calendar v-model="calendarDate">
      <!-- 自定义日期单元格 -->
      <template #date-cell="{ data }">
        <!--
          中文注释：
          data.type 的值为 'prev-month', 'current-month', 'next-month'
          根据 type 判断是否为当月日期，非当月日期格子置空且不可点击
        -->
        <div
          class="date-cell"
          :class="{ 'is-other-month': data.type !== 'current-month' }"
          @click="data.type === 'current-month' && openDayDialog(data.day)"
        >
          <template v-if="data.type === 'current-month'">
            <div class="date-header">
              <span class="day-number">{{ getDayNumber(data.day) }}</span>
              <span v-if="isHoliday(data.day)" class="rest-badge">休</span>
            </div>
            <span v-if="isToday(data.day)" class="today-dot"></span>

            <!-- 中文注释：排班项容器 -->
            <div
              v-if="schedules[data.day] && schedules[data.day].length > 0"
              class="schedule-list-wrapper"
            >
              <div
                :ref="(el) => (scheduleListRefs[data.day] = el as HTMLElement)"
                class="schedule-list"
              >
                <div
                  v-for="(it, idx) in schedules[data.day]"
                  :key="it.id + '-' + idx"
                  class="doctor-pill"
                >
                  {{ it.doctorName }}({{ shiftCodeMap[it.shiftCode] }})
                </div>
              </div>
              <div v-if="hiddenSchedulesCount[data.day] > 0" class="more-count">
                +{{ hiddenSchedulesCount[data.day] }}
              </div>
            </div>
            <!-- 中文注释：如果当天不是节假日且没有排班，则显示“无排班” -->
            <div v-else-if="!isHoliday(data.day)" class="empty-tip">无排班</div>
          </template>
        </div>
      </template>
    </el-calendar>

    <!-- 弹窗：展示某天的全部排班详情（可滚动） -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="450px">
      <div class="dialog-body">
        <template v-if="currentDayItems.length">
          <div class="dialog-scroll">
            <div
              v-for="(it, i) in currentDayItems"
              :key="it.id + '-' + i"
              class="detail-row"
            >
              <span class="name">{{ it.doctorName }}</span>
              <span class="shift">（{{ shiftCodeMap[it.shiftCode] }}）</span>
              <span class="dept">· {{ it.deptName }}</span>
              <span class="title">· {{ it.title }}</span>
            </div>
          </div>
        </template>
        <template v-else>
          <div class="dialog-empty">该日无排班</div>
        </template>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 添加排班表弹窗（仅管理员可见） -->
    <el-dialog v-model="addDialogVisible" title="添加排班表" width="520px">
      <!-- 中文注释：内容暂为空，后续接入排班编辑表单 -->
      <div class="dialog-empty">功能建设中：此处填入排班编辑表单</div>
      <template #footer>
        <el-button @click="addDialogVisible = false">关闭</el-button>
        <el-button type="primary" disabled>保存（待实现）</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
/**
 * 中文注释：
 * - 功能：展示某月医生排班（日历表格，每日最多显示 3 名医生，点击查看全部）
 * - 接口：当前用本地模拟数据，预留 loadSchedules() 函数以便后续接入后端
 * - 交互：月份切换（上一月/下一月）、月份选择器、点击日期弹窗
 */
import {
  ref,
  computed,
  onMounted,
  reactive,
  watch,
  onBeforeUnmount,
  nextTick
} from 'vue'
import { fetchHolidays, fetchScheduleCalendarByRange } from '@/api/modules/schedule'
import { useUserStore } from '@/stores/user'
import type { DoctorScheduleItem, ShiftCode } from '@/api/types/scheduleTypes'

// 中文注释：全局加载状态
const isLoading = ref(false)
// 中文注释：当前选中的日期，用于 el-calendar 控件（值为 Date）
const calendarDate = ref<Date>(new Date())
// 中文注释：月份选择器的值（YYYY-MM），用于联动日历
const monthPicker = ref<string>(formatYearMonth(new Date()))

/* 中文注释：排班数据结构，key 为 YYYY-MM-DD，value 为当日完整排班项数组（DoctorScheduleItem[]） */
const schedules = ref<Record<string, DoctorScheduleItem[]>>({})
/** 中文注释：当月节假日集合，key 为 YYYY-MM-DD */
const holidays = ref<Record<string, string>>({})

// 中文注释：用于获取每日排班列表的 DOM 引用
const scheduleListRefs = ref<Record<string, HTMLElement>>({})
// 中文注释：存储每日被隐藏的排班数量
const hiddenSchedulesCount = reactive<Record<string, number>>({})

// 中文注释：弹窗相关状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentDayItems = ref<DoctorScheduleItem[]>([])
const addDialogVisible = ref(false)

/** 中文注释：是否管理员（仅管理员可见“添加排班表”按钮） */
const userStore = useUserStore()
/** 中文注释：后端可能返回数字或字符串角色，做一个映射统一为 'admin'|'doctor'|'user' */
const roleMap: Record<string | number, 'user' | 'doctor' | 'admin'> = {
  0: 'admin',
  1: 'doctor',
  2: 'user',
  user: 'user',
  admin: 'admin',
  doctor: 'doctor'
}

/** 中文注释：班次代码中文映射 */
const shiftCodeMap: Record<ShiftCode, string> = {
  AM: '上午',
  PM: '下午',
  FULL: '全天'
}

const isAdmin = computed(() => {
  const rawRole = (userStore as any)?.userInfo?.role
  const role = roleMap[rawRole] ?? ''
  return role === 'admin'
})

/** 中文注释：初始化与刷新排班数据 */
const reload = async () => {
  isLoading.value = true
  // 清空旧数据，避免在加载时显示上个月的内容
  schedules.value = {}
  holidays.value = {}

  // 中文注释：并行加载数据，并保证至少有 1 秒的加载动画
  const fetchDataPromise = Promise.all([
    loadSchedules(monthPicker.value),
    loadHolidays(monthPicker.value)
  ])
  const minDelayPromise = new Promise(resolve => setTimeout(resolve, 1000))

  try {
    const [fetchedData] = await Promise.all([fetchDataPromise, minDelayPromise])
    const [newSchedules, newHolidays] = fetchedData
    schedules.value = newSchedules
    holidays.value = newHolidays
  } catch (error) {
    // 错误在各自的加载函数中已处理（返回空对象），这里仅作记录
    console.error('An error occurred during data reload:', error)
    schedules.value = {}
    holidays.value = {}
  } finally {
    isLoading.value = false
  }
}

/** 中文注释：上一月 */
const goPrevMonth = () => {
  const dt = new Date(calendarDate.value)
  dt.setMonth(dt.getMonth() - 1)
  calendarDate.value = dt
  monthPicker.value = formatYearMonth(dt)
  reload()
}

/** 中文注释：下一月 */
const goNextMonth = () => {
  const dt = new Date(calendarDate.value)
  dt.setMonth(dt.getMonth() + 1)
  calendarDate.value = dt
  monthPicker.value = formatYearMonth(dt)
  reload()
}

/** 中文注释：月份选择变化 */
const onMonthChange = (val: string) => {
  // 将月份字符串转换为该月第一天
  const dt = parseYearMonthToDate(val)
  calendarDate.value = dt
  reload()
}

/** 中文注释：点击日期，弹窗展示该日排班医生列表 */
const openDayDialog = (dayStr: string) => {
  dialogTitle.value = `排班（${dayStr}）`
  currentDayItems.value = schedules.value[dayStr] || []
  dialogVisible.value = true
}

/** 中文注释：工具函数：获取日期中的“日” */
const getDayNumber = (dayStr: string): string => {
  try {
    return dayStr.split('-')[2] || ''
  } catch {
    return ''
  }
}

/** 中文注释：格式化年月 YYYY-MM */
function formatYearMonth(dt: Date): string {
  const y = dt.getFullYear()
  const m = String(dt.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/** 中文注释：将 YYYY-MM 转换为当月第一天的 Date 对象 */
function parseYearMonthToDate(val: string): Date {
  const [y, m] = (val || '').split('-').map(s => Number(s))
  const year = Number.isFinite(y) ? y : new Date().getFullYear()
  const month = Number.isFinite(m) ? m - 1 : new Date().getMonth()
  return new Date(year, month, 1)
}

/** 中文注释：加载某月的排班数据（改为：按时间范围查询 /schedule/calendar） */
async function loadSchedules(ym: string): Promise<Record<string, DoctorScheduleItem[]>> {
  try {
    // 计算该月的起止日期（YYYY-MM-DD）
    const base = parseYearMonthToDate(ym)
    const year = base.getFullYear()
    const month = base.getMonth() + 1
    const firstDay = `${year}-${String(month).padStart(2, '0')}-01`
    const lastDayDate = new Date(year, month, 0) // 当月最后一天
    const lastDay = `${year}-${String(month).padStart(2, '0')}-${String(lastDayDate.getDate()).padStart(2, '0')}`

    // 从页面/用户状态提取查询维度：
    // - 若当前登录为医生，则自动携带 doctorId；非医生角色不传
    const rawUserId = (userStore as any)?.userInfo?.id
    const rawRole = (userStore as any)?.userInfo?.role
    const role = roleMap[rawRole] ?? ''
    const doctorId = role === 'doctor' && Number.isFinite(Number(rawUserId)) ? Number(rawUserId) : undefined

    // - 科室过滤暂不传；如需按科室过滤，可在页面添加选择器后写入 deptId
    const query = {
      startDate: firstDay,
      endDate: lastDay,
      doctorId,
      // deptId: 可根据页面筛选控件设置
    }

    // 发起接口请求（统一风格：返回 ApiResponse<DoctorScheduleItem[]>）
    const { data } = await fetchScheduleCalendarByRange(query as any)

    // 映射为 { [YYYY-MM-DD]: DoctorScheduleItem[] }（保留完整条目用于弹窗）
    const map: Record<string, DoctorScheduleItem[]> = {}
    for (const item of data || []) {
      const day = item.scheduleDate
      if (!map[day]) map[day] = []
      map[day].push(item)
    }
    return map
  } catch {
    return {}
  }
}

/** 中文注释：加载某月节假日（接入后端替换） */
async function loadHolidays(ym: string): Promise<Record<string, string>> {
  try {
    const { data } = await fetchHolidays(ym)
    const map: Record<string, string> = {}
    for (const it of data || []) {
      if (it.type === 'holiday' || !it.type) {
        map[it.date] = it.name
      }
    }
    return map
  } catch {
    return {}
  }
}

/** 中文注释：判断某日是否为法定节假日 */
function isHoliday(dayStr: string): boolean {
  return !!holidays.value[dayStr]
}

/** 中文注释：判断是否为“今天”（用于右下角蓝点） */
function isToday(dayStr: string): boolean {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const todayStr = `${y}-${m}-${d}`
  return dayStr === todayStr
}

const updateHiddenCounts = async () => {
  await nextTick()
  for (const day in scheduleListRefs.value) {
    const container = scheduleListRefs.value[day]
    if (!container) {
      hiddenSchedulesCount[day] = 0
      continue
    }

    const containerRect = container.getBoundingClientRect()
    const pills = container.querySelectorAll('.doctor-pill')
    let hiddenCount = 0
    let isHiding = false
    
    // 先移除所有 is-hidden 类，以便重新计算
    pills.forEach(p => p.classList.remove('is-hidden'))

    for (let i = 0; i < pills.length; i++) {
      const pill = pills[i] as HTMLElement
      if (isHiding) {
        pill.classList.add('is-hidden')
        hiddenCount++
        continue
      }
      const pillRect = pill.getBoundingClientRect()
      // 检查药丸是否完全在容器内（水平方向），增加1px容差
      if (pillRect.right > containerRect.right + 1) {
        isHiding = true
        pill.classList.add('is-hidden')
        hiddenCount++
      }
    }
    hiddenSchedulesCount[day] = hiddenCount
  }
}

// When schedules data changes, re-calculate
watch(schedules, updateHiddenCounts, { deep: true, flush: 'post' })

onMounted(() => {
  reload()
  window.addEventListener('resize', updateHiddenCounts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateHiddenCounts)
})


/** 中文注释：打开添加排班弹窗 */
function openAddDialog() {
  addDialogVisible.value = true
}
</script>

<style scoped>
.schedule-page {
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 6%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  min-height: 0;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
}
.month-picker {
  width: 140px;
}
.refresh-btn {
  margin-left: auto;
}
/* 让内部内容充满整个日期格，背景色能覆盖整格 */
.el-calendar-day {
  padding: 0;
}

/* 日期单元格样式优化，保证医生名字显示清晰且不撑爆 */
.date-cell {
  position: relative;
  padding: 6px;
  border-radius: 6px;
  min-height: 80px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.date-cell:hover {
  background: var(--el-color-primary-light-9);
  cursor: pointer;
}
.date-cell.is-other-month {
  cursor: default;
}
.date-cell.is-other-month:hover {
  background: transparent;
}

.date-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative; /* 中文注释：用于定位“休”徽标 */
}
.day-number {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.schedule-list-wrapper {
  position: relative;
  margin-top: 4px;
  height: 22px; /* Give it a fixed height to contain pills and count */
}

.schedule-list {
  display: flex;
  flex-wrap: nowrap; /* 中文注释：强制单行显示，避免换行撑高格子 */
  gap: 4px; /* 中文注释：减小间距 */
  overflow: hidden; /* 中文注释：超出部分直接隐藏 */
  height: 100%;
}
.doctor-pill {
  background: var(--el-color-primary-light-3);
  color: #fff;
  font-size: 12px;
  line-height: 18px; /* 中文注释：减小行高 */
  padding: 0 6px; /* 中文注释：减小内边距 */
  border-radius: 4px; /* 中文注释：减小圆角，使其更紧凑 */
  white-space: nowrap;
  flex-shrink: 0; /* 中文注释：禁止药丸本身被压缩 */
}
.doctor-pill.is-hidden {
  display: none;
}
.more-pill {
  /* not used */
}

.more-count {
  position: absolute;
  bottom: -15px;
  font-size: 11px;
  font-weight: bold;
  color: #555;
  background-color: rgba(230, 230, 230, 0.7);
  padding: 0 4px;
  border-radius: 3px;
  z-index: 1;
}

.empty-tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

/* 弹窗内排班标签样式 */
.dialog-body {
  max-height: 320px; /* 中文注释：限制高度，出现滚动 */
  overflow: auto;
  padding-right: 10px; /* 留出滚动条空间 */
}
.dialog-scroll {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.detail-row {
  font-size: 14px;
  line-height: 22px;
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  gap: 6px;
}
.detail-row .name {
  font-weight: 600;
}
.detail-row .shift {
  color: var(--el-color-primary);
  font-weight: 500;
}
.detail-row .dept,
.detail-row .title {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.dialog-empty {
  color: var(--el-text-color-secondary);
  text-align: center;
  padding: 20px 0;
}
.rest-badge {
  position: absolute;
  right: 4px;
  top: 2px;
  background: #32cd32; /* 淡绿底更醒目 */
  color: #fff;
  font-size: 12px;
  line-height: 18px;
  padding: 0 6px;
  border-radius: 10px;
}
/* 中文注释：右下角“今天”蓝色实心小圆点 */
.today-dot {
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 8px;
  height: 8px;
  background: var(--el-color-primary);
  border-radius: 50%;
}
.add-btn {
  /* 中文注释：放在右侧刷新按钮后面，增加一点间距 */
  margin-left: 8px;
}

/* 让包含“休”徽标的日期格呈现为 el-calendar 默认的“选中”整格高亮 */
:deep(.el-calendar) td:has(.rest-badge) .el-calendar-day {
  background: var(--el-color-primary-light-9);
}
</style>