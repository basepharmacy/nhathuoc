import { type Database } from '@/services/supabase/database.types'

export type StockAdjustmentReasonCode = Database['public']['Enums']['reason_code']

type ReasonCodeOption = {
  value: StockAdjustmentReasonCode
  label: string
}

export const INCREASE_REASON_CODE_OPTIONS: ReasonCodeOption[] = [
  { value: '1_FIRST_STOCK', label: 'Điều chỉnh lần đầu' },
  { value: '9_OTHER', label: 'Khác' },
]

export const DECREASE_REASON_CODE_OPTIONS: ReasonCodeOption[] = [
  { value: '2_DAMAGED', label: 'Hàng hư hỏng' },
  { value: '3_EXPIRED', label: 'Hàng hết hạn' },
  { value: '4_LOST', label: 'Hàng mất' },
  { value: '9_OTHER', label: 'Khác' },
]

const REASON_CODE_LABEL_MAP: Record<StockAdjustmentReasonCode, string> = {
  '1_FIRST_STOCK': 'Điều chỉnh lần đầu',
  '2_DAMAGED': 'Hàng hư hỏng',
  '3_EXPIRED': 'Hàng hết hạn',
  '4_LOST': 'Hàng mất',
  '9_OTHER': 'Khác',
}

export const ALL_REASON_CODE_OPTIONS: ReasonCodeOption[] = [
  { value: '1_FIRST_STOCK', label: 'Điều chỉnh lần đầu' },
  { value: '2_DAMAGED', label: 'Hàng hư hỏng' },
  { value: '3_EXPIRED', label: 'Hàng hết hạn' },
  { value: '4_LOST', label: 'Hàng mất' },
  { value: '9_OTHER', label: 'Khác' },
]

export const getReasonCodeOptionsByQuantity = (quantity: number) =>
  quantity < 0 ? DECREASE_REASON_CODE_OPTIONS : INCREASE_REASON_CODE_OPTIONS

export const getReasonCodeLabel = (
  reasonCode?: StockAdjustmentReasonCode | null
) => {
  if (!reasonCode) return '-'
  return REASON_CODE_LABEL_MAP[reasonCode] ?? reasonCode
}
