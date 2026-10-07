import { z } from 'zod'
import { isValidSignedQuantity } from '@/lib/quantity'

export const stockAdjustmentSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  product_id: z.string(),
  location_id: z.string(),
  batch_id: z.string().nullable(),
  batch_code: z.string().nullable(),
  // numeric(14,3): điều chỉnh kho cho số lẻ để dọn được phần dư do bán phân số
  // sinh ra. Quá 3 chữ số thập phân sẽ bị Postgres làm tròn im lặng.
  quantity: z.number().refine(isValidSignedQuantity, {
    message: 'Số lượng phải khác 0 và tối đa 3 chữ số thập phân.',
  }),
  expiry_date: z.string().nullable(),
  reason: z.string().nullable(),
  reason_code: z.enum(['1_FIRST_STOCK', '2_DAMAGED', '3_EXPIRED', '4_LOST', '9_OTHER']),
  cost_price: z.number().nullable(),
  created_at: z.string().nullable(),
})

export type StockAdjustmentRow = z.infer<typeof stockAdjustmentSchema>
