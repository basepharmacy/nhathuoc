import { type ProductWithUnits } from '@/services/supabase/database/repo/productsRepo'

export type PaymentMethod = 'CASH' | 'TRANSFER'

export type SaleOrderItem = {
  id: string
  product: ProductWithUnits
  productUnitId: string | null
  quantity: number
  unitPrice: number
  discount: number
  batchId: string
  batchCode: string
  expiryDate: string
  stock: number
}

export const getDefaultUnit = (product: ProductWithUnits) =>
  product.product_units?.find((unit) => unit.is_base_unit) ??
  product.product_units?.[0]
