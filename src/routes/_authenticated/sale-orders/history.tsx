import { createFileRoute } from '@tanstack/react-router'
import { SaleOrdersHistory } from '@/features/sale-orders-history'

export const Route = createFileRoute('/_authenticated/sale-orders/history')({
  component: SaleOrdersHistory,
})
