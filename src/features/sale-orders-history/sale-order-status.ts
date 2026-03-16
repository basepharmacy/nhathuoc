import type { SaleOrderStatus } from '@/services/supabase/database/model'

export const saleOrderStatusLabels: Record<SaleOrderStatus, string> = {
  '1_DRAFT': 'Nháp',
  '2_COMPLETE': 'Hoàn tất',
  '7_DAV_ERROR': 'Lỗi DAV',
  '8_INSUFFICIENT_STOCK': 'Thiếu tồn kho',
  '9_CANCELLED': 'Đã hủy',
}

export const saleOrderStatusColors: Record<SaleOrderStatus, string> = {
  '1_DRAFT': 'bg-neutral-200/60 text-foreground border-neutral-300',
  '2_COMPLETE': 'bg-emerald-100/40 text-emerald-900 dark:text-emerald-200 border-emerald-200',
  '7_DAV_ERROR': 'bg-yellow-100/40 text-yellow-900 dark:text-yellow-200 border-yellow-200',
  '8_INSUFFICIENT_STOCK': 'bg-red-100/40 text-red-900 dark:text-red-200 border-red-300',
  '9_CANCELLED': 'bg-rose-200/40 text-rose-900 dark:text-rose-100 border-rose-300',
}
