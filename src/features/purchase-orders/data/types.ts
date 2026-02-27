import { type ProductWithUnits } from '@/services/supabase/database/repo/productsRepo'

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
