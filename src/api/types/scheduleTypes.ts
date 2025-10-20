/**
 * 排班/节假日相关类型（中文注释）
 */

/** 查询参数：按月查询节假日，格式 YYYY-MM */
export interface HolidayQuery {
  /** 月份，格式：YYYY-MM */
  month: string
}

/** 节假日条目 */
export interface HolidayItem {
  /** 日期，格式：YYYY-MM-DD */
  date: string
  /** 名称，如：国庆节、中秋节 */
  name: string
  /** 类型：holiday=法定节假日，workday=调休工作日，festival=普通节日 */
  type?: 'holiday' | 'workday' | 'festival'
}

/** 接口返回：节假日列表 */
export interface HolidayListResp {
  /** 节假日列表 */
  list: HolidayItem[]
}

/** ================== 医生排班相关类型 ================== */

/** 班次编码：AM=上午，PM=下午，FULL=全天 */
export type ShiftCode = 'AM' | 'PM' | 'FULL'

/** 医生排班条目（与后端示例字段一致） */
export interface DoctorScheduleItem {
  id: number
  createdAt: string
  updatedAt: string
  /** 排班日期，格式：YYYY-MM-DD */
  scheduleDate: string
  /** 班次编码：AM/PM/FULL */
  shiftCode: ShiftCode
  /** 医生姓名 */
  doctorName: string
  /** 科室名称 */
  deptName: string
  /** 职称 */
  title: string
}

/** 月度排班查询参数 */
export interface ScheduleCalendarQuery {
  /** 月份，格式：YYYY-MM */
  month: string
}

/** 月度排班返回 */
export interface ScheduleCalendarResp {
  /** 列表数据 */
  list: DoctorScheduleItem[]
}

/** ================== 新增：医生排班日历查询（按时间范围） ================== */
/**
 * 前端查询类（与后端 LocalDate 对齐，前端使用字符串 'YYYY-MM-DD'）
 * - startDate / endDate：日期范围
 * - doctorId：医生ID
 * - deptId：科室ID
 */
export interface DoctorScheduleCalendarQuery {
  /** 排班日期起始（YYYY-MM-DD） */
  startDate?: string
  /** 排班日期结束（YYYY-MM-DD） */
  endDate?: string
  /** 医生ID */
  doctorId?: number
  /** 科室ID */
  deptId?: number
}