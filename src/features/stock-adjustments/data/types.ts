import { type ProductWithUnits } from '@/services/supabase/database/repo/productsRepo'
import { type StockAdjustmentReasonCode } from './reason-code'

export type AdjustmentItem = {
  id: string
  product: ProductWithUnits
  productUnitId: string | null
  quantity: number
  costPrice: number
  batchCode: string
  expiryDate: string
  reasonCode: StockAdjustmentReasonCode
  reason: string
}

export const getDefaultUnit = (product: ProductWithUnits) =>
  product.product_units?.find((unit) => unit.is_base_unit) ??
  product.product_units?.[0]
