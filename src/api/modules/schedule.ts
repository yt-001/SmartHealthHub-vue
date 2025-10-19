/**
 * 排班与节假日模块接口（中文注释）
 * 说明：预留真实后端接口；当前提供一个示例 fetchHolidays(month)，可直接替换为你的后端地址。
 */

import type { HolidayItem, HolidayListResp } from '@/api/types/scheduleTypes'

/**
 * 获取某月节假日列表
 * @param month 月份，格式 YYYY-MM
 * @returns Promise<{ data: HolidayItem[] }>
 */
export async function fetchHolidays(month: string): Promise<{ data: HolidayItem[] }> {
  // TODO: 接入后端，如：
  // const resp = await http.get<HolidayListResp>('/api/calendar/holidays', { params: { month } })
  // return { data: resp.data.list || [] }

  // 临时模拟：常见法定节假日（示例），实际以后端为准
  const mock: Record<string, HolidayItem[]> = {
    '2025-10': [
      { date: '2025-10-01', name: '国庆节', type: 'holiday' },
      { date: '2025-10-02', name: '国庆节', type: 'holiday' },
      { date: '2025-10-03', name: '国庆节', type: 'holiday' },
      { date: '2025-10-04', name: '国庆节', type: 'holiday' },
      { date: '2025-10-05', name: '国庆节', type: 'holiday' },
      { date: '2025-10-06', name: '国庆节', type: 'holiday' },
      { date: '2025-10-07', name: '国庆节', type: 'holiday' }
    ]
  }
  const list = mock[month] || []
  return { data: list }
}