<template>
  <!-- 中文注释：排班日历页面 -->
  <div class="schedule-page">
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
        <!-- 中文注释：data.day 为 YYYY-MM-DD 字符串 -->
        <div class="date-cell" @click="openDayDialog(data.day)">
          <div class="date-header">
            <span class="day-number">{{ getDayNumber(data.day) }}</span>
            <span v-if="isHoliday(data.day)" class="rest-badge">休</span>
          </div>
          <span v-if="isToday(data.day)" class="today-dot"></span>
          <div class="schedule-list">
            <template v-if="schedules[data.day] && schedules[data.day].length">
              <!-- 只展示最多 3 个医生名字 -->
              <div v-for="(doc, idx) in schedules[data.day].slice(0, 3)" :key="doc + idx" class="doctor-pill">
                {{ doc }}
              </div>
              <div v-if="schedules[data.day].length > 3" class="more-pill">
                +{{ schedules[data.day].length - 3 }}
              </div>
            </template>
            <template v-else>
              <div class="empty-tip">无排班</div>
            </template>
          </div>
        </div>
      </template>
    </el-calendar>

    <!-- 弹窗：展示某天的全部排班医生 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="420px">
      <div class="dialog-body">
        <template v-if="currentDayDoctors.length">
          <el-tag
            v-for="(doc, i) in currentDayDoctors"
            :key="doc + i"
            class="tag-item"
            type="primary"
            effect="plain"
          >
            {{ doc }}
          </el-tag>
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
import { ref, computed, onMounted } from 'vue'
import { fetchHolidays } from '@/api/modules/schedule'
import { useUserStore } from '@/stores/user'

// 中文注释：当前选中的日期，用于 el-calendar 控件（值为 Date）
const calendarDate = ref<Date>(new Date())
// 中文注释：月份选择器的值（YYYY-MM），用于联动日历
const monthPicker = ref<string>(formatYearMonth(new Date()))

// 中文注释：排班数据结构，key 为 YYYY-MM-DD，value 为医生姓名数组
const schedules = ref<Record<string, string[]>>({})
/** 中文注释：当月节假日集合，key 为 YYYY-MM-DD */
const holidays = ref<Record<string, string>>({})

// 中文注释：弹窗相关状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const currentDayDoctors = ref<string[]>([])
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
const isAdmin = computed(() => {
  const rawRole = (userStore as any)?.userInfo?.role
  const role = roleMap[rawRole] ?? ''
  return role === 'admin'
})

/** 中文注释：初始化与刷新排班数据 */
const reload = async () => {
  // 并行加载：排班与节假日
  await Promise.all([loadSchedules(monthPicker.value), loadHolidays(monthPicker.value)])
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
  currentDayDoctors.value = schedules.value[dayStr] || []
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

/** 中文注释：模拟加载某月的排班数据（接入后端时替换此函数） */
async function loadSchedules(ym: string) {
  // TODO: 接入后端接口，例如：GET /api/schedule?month=YYYY-MM
  // 返回格式建议：{ date: 'YYYY-MM-DD', doctors: string[] }[]
  // 这里先用简单的本地模拟，确保交互流程完整
  const mock: Record<string, string[]> = {}
  const baseDate = parseYearMonthToDate(ym)
  const daysInMonth = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate()

  // 中文注释：模拟一些排班，随机填充 0~5 位医生
  const doctorPool = ['张三', '李四', '王五', '赵六', '孙七', '周八', '吴九', '郑十']
  for (let d = 1; d <= daysInMonth; d++) {
    const day = String(d).padStart(2, '0')
    const dayKey = `${formatYearMonth(baseDate)}-${day}`
    const count = Math.floor(Math.random() * 6) // 0~5
    mock[dayKey] = Array.from({ length: count }, (_, i) => doctorPool[(d + i) % doctorPool.length])
  }

  schedules.value = mock
}

/** 中文注释：加载某月节假日（接入后端替换） */
async function loadHolidays(ym: string) {
  try {
    const { data } = await fetchHolidays(ym)
    const map: Record<string, string> = {}
    for (const it of data || []) {
      if (it.type === 'holiday' || !it.type) {
        map[it.date] = it.name
      }
    }
    holidays.value = map
  } catch {
    holidays.value = {}
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

onMounted(() => {
  reload()
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

.schedule-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.doctor-pill {
  background: var(--el-color-primary);
  color: #fff;
  font-size: 12px;
  line-height: 20px;
  padding: 0 8px;
  border-radius: 10px;
}
.more-pill {
  background: var(--el-color-primary-light-7);
  color: var(--el-color-primary);
  font-size: 12px;
  line-height: 20px;
  padding: 0 8px;
  border-radius: 10px;
}
.empty-tip {
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

/* 弹窗内排班标签样式 */
.dialog-body {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tag-item {
  margin-bottom: 4px;
}
.dialog-empty {
  color: var(--el-text-color-secondary);
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