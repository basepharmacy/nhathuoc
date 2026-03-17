import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { StockAdjustmentsAddNew } from '@/features/stock-adjustments/pages/stock-adjustments-add-new'

export const Route = createFileRoute('/_authenticated/inventory/adjustments/new')({
  validateSearch: z.object({
    productId: z.string().optional().catch(undefined),
  }),
  component: StockAdjustmentsAddNew,
})
