import { ProductWithUnits } from '@/services/supabase/'
import { PurchaseOrderStatus } from '@/services/supabase/'

export type PaymentStatus = '1_UNPAID' | '2_PARTIALLY_PAID' | '3_PAID'

export type OrderItem = {
  id: string
  product: ProductWithUnits
  productUnitId: string | null
  quantity: number
  unitPrice: number
  discount: number
  batchCode: string
  expiryDate: string
}

export const getDefaultUnit = (product: ProductWithUnits) =>
  product.product_units?.find((unit) => unit.is_base_unit) ??
  product.product_units?.[0]

// tìm product_units có conversion_factor lớn nhất để lấy giá trị quy đổi về đơn vị lớn nhất
export const getBiggestConversionUnit = (product: ProductWithUnits) =>
  product.product_units?.reduce((prev, current) => {
    if ((current.conversion_factor ?? 1) > (prev.conversion_factor ?? 1)) {
      return current
    }
    return prev
  }
  )

export const statusLabels: Record<PurchaseOrderStatus, string> = {
  '1_DRAFT': 'Nháp',
  '2_ORDERED': 'Đã đặt',
  '3_CHECKING': 'Đang kiểm',
  '4_STORED': 'Đã nhập kho',
  '9_CANCELLED': 'Đã hủy',
}

export const statusColors: Record<PurchaseOrderStatus, string> = {
  '1_DRAFT': 'bg-neutral-200/60 text-foreground border-neutral-300',
  '2_ORDERED': 'bg-blue-100/40 text-blue-900 dark:text-blue-200 border-blue-200',
  '3_CHECKING': 'bg-amber-200/40 text-amber-900 dark:text-amber-100 border-amber-300',
  '4_STORED': 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
  '9_CANCELLED': 'bg-rose-200/40 text-rose-900 dark:text-rose-100 border-rose-300',
}