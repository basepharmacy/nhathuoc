import { endOfWeek, format, startOfWeek } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { TimePeriod } from '..'

/** Loại kỳ dùng dropdown danh sách (3 năm gần nhất). */
export type SelectablePeriod = 'month' | 'quarter' | 'year'

/**
 * Sinh danh sách option kỳ cho month/quarter/year trong 3 năm gần nhất.
 * value: month -> 'yyyy-MM', quarter -> 'yyyyQQ', year -> 'yyyy'.
 */
export function getPeriodOptions(period: SelectablePeriod) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const options: { value: string; label: string }[] = []

  if (period === 'month') {
    for (let y = currentYear; y >= currentYear - 3; y--) {
      const endM = y === currentYear ? currentMonth : 12
      for (let m = endM; m >= 1; m--) {
        const mm = String(m).padStart(2, '0')
        options.push({ value: `${y}-${mm}`, label: `${mm}/${y}` })
      }
    }
  } else if (period === 'quarter') {
    for (let y = currentYear; y >= currentYear - 3; y--) {
      const maxQ = y === currentYear ? Math.ceil(currentMonth / 3) : 4
      for (let q = maxQ; q >= 1; q--) {
        const sm = (q - 1) * 3 + 1
        const em = q * 3
        options.push({
          value: `${y}${String(q).padStart(2, '0')}`,
          label: `Quý ${q} ${y} (${sm}~${em})`,
        })
      }
    }
  } else {
    for (let y = currentYear; y >= currentYear - 3; y--) {
      options.push({ value: `${y}`, label: `Năm ${y}` })
    }
  }

  return options
}

/** Chuyển giá trị option (yyyy-MM / yyyyQQ / yyyy) thành reference date 'yyyy-MM-dd'. */
export function periodValueToReferenceDate(
  period: SelectablePeriod,
  selectedValue: string
): string {
  if (period === 'month') {
    return `${selectedValue}-01`
  }
  if (period === 'quarter') {
    const year = selectedValue.slice(0, 4)
    const quarter = parseInt(selectedValue.slice(4), 10)
    const month = String((quarter - 1) * 3 + 1).padStart(2, '0')
    return `${year}-${month}-01`
  }
  return `${selectedValue}-01-01`
}

/** Từ reference date 'yyyy-MM-dd' suy ra value option đang chọn cho Select. */
export function referenceDateToPeriodValue(
  period: SelectablePeriod,
  referenceDate: string
): string {
  const [y, m] = referenceDate.split('-')
  if (period === 'month') {
    return `${y}-${m}`
  }
  if (period === 'quarter') {
    const quarter = Math.ceil(parseInt(m, 10) / 3)
    return `${y}${String(quarter).padStart(2, '0')}`
  }
  return `${y}`
}

/** Reference date của hôm nay ('yyyy-MM-dd'). */
export function todayReferenceDate(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/** Parse 'yyyy-MM-dd' thành Date (local). */
export function parseReferenceDate(referenceDate: string): Date {
  const [y, m, d] = referenceDate.split('-').map(Number)
  return new Date(y, (m ?? 1) - 1, d ?? 1)
}

/** Nhãn tuần (T2–CN) chứa ngày: 'Tuần dd/MM - dd/MM/yyyy'. */
export function getWeekLabel(date: Date): string {
  const start = startOfWeek(date, { locale: vi, weekStartsOn: 1 })
  const end = endOfWeek(date, { locale: vi, weekStartsOn: 1 })
  return `Tuần ${format(start, 'dd/MM')} - ${format(end, 'dd/MM/yyyy')}`
}

/** Nhãn mô tả kỳ đang chọn để hiển thị dưới mỗi thẻ số liệu. */
export function getPeriodDescription(
  period: TimePeriod,
  referenceDate: string
): string {
  const date = parseReferenceDate(referenceDate)
  switch (period) {
    case 'day':
      return format(date, 'dd/MM/yyyy')
    case 'week':
      return getWeekLabel(date)
    case 'month':
      return `Tháng ${format(date, 'MM/yyyy')}`
    case 'quarter': {
      const quarter = Math.ceil((date.getMonth() + 1) / 3)
      return `Quý ${quarter} ${date.getFullYear()}`
    }
    case 'year':
      return `Năm ${date.getFullYear()}`
  }
}
