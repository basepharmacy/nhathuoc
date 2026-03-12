import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { SaleOrders as SaleOrderDetail } from '@/features/sale-order-detail'

export const Route = createFileRoute('/_authenticated/sale-orders/detail')({
  validateSearch: z.object({
    orderId: z.string().catch(''),
  }),
  component: SaleOrderDetail,
})
