import { createFileRoute } from '@tanstack/react-router'
import { StockAdjustmentsAddNew } from '@/features/stock-adjustments/pages/stock-adjustments-add-new'

export const Route = createFileRoute('/_authenticated/inventory/adjustments/new')({
  component: StockAdjustmentsAddNew,
})
