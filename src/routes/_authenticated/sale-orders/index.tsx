import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { SaleOrders } from '@/features/sale-orders'

export const Route = createFileRoute('/_authenticated/sale-orders/')({
  validateSearch: z.object({
    orderId: z.string().optional().catch(undefined),
  }),
  component: SaleOrders,
})
