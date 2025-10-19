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