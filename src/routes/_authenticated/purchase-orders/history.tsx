import { createFileRoute } from '@tanstack/react-router'
import { PurchaseOrdersHistory } from '@/features/purchase-orders-history'

export const Route = createFileRoute('/_authenticated/purchase-orders/history')({
  component: PurchaseOrdersHistory,
})
