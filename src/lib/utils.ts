import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const normalizeSearchValue = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()

export const includesSearchValue = (source: string, search: string) =>
  normalizeSearchValue(source).includes(normalizeSearchValue(search))

export function sleep(ms: number = 1000) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type FormatCurrencyOptions = {
  fallback?: string
  locale?: string
  style?: Intl.NumberFormatOptions['style']
  currency?: string
  maximumFractionDigits?: number
  minimumFractionDigits?: number
  clampZero?: boolean
}

export function formatCurrency(
  value: number | string | null | undefined,
  {
    fallback = '—',
    locale = 'vi-VN',
    style = 'decimal',
    currency = 'VND',
    maximumFractionDigits,
    minimumFractionDigits,
    clampZero = true,
  }: FormatCurrencyOptions = {}
) {
  if (value === '' || value === null || value === undefined) return fallback
  const numericValue = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(numericValue)) return fallback
  const safeValue = clampZero ? Math.max(0, numericValue) : numericValue
  const formatter = new Intl.NumberFormat(locale, {
    style,
    currency,
    maximumFractionDigits:
      maximumFractionDigits ?? (style === 'currency' ? 0 : 0),
    minimumFractionDigits,
  })
  return formatter.format(safeValue)
}

export const normalizeNumber = (value: string) => {
  if (!value) return 0
  const normalized = value.replace(/[^0-9]/g, '')
  return normalized ? Number(normalized) : 0
}

export const formatDateLabel = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN').format(date)
}

export const formatDateTimeLabel = (value?: string | null) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export const formatQuantity = (value?: number | null) =>
  new Intl.NumberFormat('vi-VN').format(value ?? 0)

export function formatShortCurrency(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return `${value}`
}

/**
 * Generates page numbers for pagination with ellipsis
 * @param currentPage - Current page number (1-based)
 * @param totalPages - Total number of pages
 * @returns Array of page numbers and ellipsis strings
 *
 * Examples:
 * - Small dataset (≤5 pages): [1, 2, 3, 4, 5]
 * - Near beginning: [1, 2, 3, 4, '...', 10]
 * - In middle: [1, '...', 4, 5, 6, '...', 10]
 * - Near end: [1, '...', 7, 8, 9, 10]
 */
export function getPageNumbers(currentPage: number, totalPages: number) {
  const maxVisiblePages = 5 // Maximum number of page buttons to show
  const rangeWithDots = []

  if (totalPages <= maxVisiblePages) {
    // If total pages is 5 or less, show all pages
    for (let i = 1; i <= totalPages; i++) {
      rangeWithDots.push(i)
    }
  } else {
    // Always show first page
    rangeWithDots.push(1)

    if (currentPage <= 3) {
      // Near the beginning: [1] [2] [3] [4] ... [10]
      for (let i = 2; i <= 4; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    } else if (currentPage >= totalPages - 2) {
      // Near the end: [1] ... [7] [8] [9] [10]
      rangeWithDots.push('...')
      for (let i = totalPages - 3; i <= totalPages; i++) {
        rangeWithDots.push(i)
      }
    } else {
      // In the middle: [1] ... [4] [5] [6] ... [10]
      rangeWithDots.push('...')
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        rangeWithDots.push(i)
      }
      rangeWithDots.push('...', totalPages)
    }
  }

  return rangeWithDots
}
