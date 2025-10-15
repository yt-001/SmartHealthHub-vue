/**
 * 时间格式化（后端返回 yyyy-MM-dd HH:mm:ss 也兼容）
 * @param val 时间值
 */
export const formatTime = (val: string | number | undefined): string => {
  if (!val) return '-'
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(val)) return val
  const d = typeof val === 'number' ? new Date(val) : new Date(String(val))
  if (Number.isNaN(d.getTime())) return String(val)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 */
export function useDebounce<T extends (...args: any[]) => any>(fn: T, delay = 300) {
  let timer: number | undefined
  return (...args: Parameters<T>): void => {
    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => fn(...args), delay)
  }
}