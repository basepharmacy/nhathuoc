import type { PurchaseOrderWithRelations } from '@/services/supabase/database/model'

export const purchaseOrderStatusLabels: Record<PurchaseOrderWithRelations['status'], string> = {
  '1_DRAFT': 'Nháp',
  '2_ORDERED': 'Đã đặt',
  '3_CHECKING': 'Đang kiểm',
  '4_STORED': 'Đã nhập kho',
  '9_CANCELLED': 'Đã hủy',
}

export const purchaseOrderStatusColors: Record<PurchaseOrderWithRelations['status'], string> = {
  '1_DRAFT': 'bg-neutral-200/60 text-foreground border-neutral-300',
  '2_ORDERED': 'bg-blue-100/40 text-blue-900 dark:text-blue-200 border-blue-200',
  '3_CHECKING': 'bg-amber-200/40 text-amber-900 dark:text-amber-100 border-amber-300',
  '4_STORED': 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
  '9_CANCELLED': 'bg-rose-200/40 text-rose-900 dark:text-rose-100 border-rose-300',
}

export const purchasePaymentStatusLabels: Record<PurchaseOrderWithRelations['payment_status'], string> = {
  '1_UNPAID': 'Chưa thanh toán',
  '2_PARTIALLY_PAID': 'Thanh toán một phần',
  '3_PAID': 'Đã thanh toán',
}

export const purchasePaymentStatusColors: Record<PurchaseOrderWithRelations['payment_status'], string> = {
  '1_UNPAID': 'bg-amber-200/40 text-amber-900 dark:text-amber-100 border-amber-300',
  '2_PARTIALLY_PAID': 'bg-blue-100/40 text-blue-900 dark:text-blue-200 border-blue-200',
  '3_PAID': 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
}
