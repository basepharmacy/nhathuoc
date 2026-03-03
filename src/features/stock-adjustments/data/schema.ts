import { z } from 'zod'

export const stockAdjustmentSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  product_id: z.string(),
  location_id: z.string(),
  batch_code: z.string(),
  quantity: z.number(),
  expiry_date: z.string().nullable(),
  reason: z.string().nullable(),
  cost_price: z.number().nullable(),
  created_at: z.string().nullable(),
})

export type StockAdjustmentRow = z.infer<typeof stockAdjustmentSchema>
