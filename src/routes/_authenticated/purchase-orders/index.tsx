import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { PurchaseOrders } from '@/features/purchase-orders'

export const Route = createFileRoute('/_authenticated/purchase-orders/')({
  validateSearch: z.object({
    orderId: z.string().optional().catch(undefined),
  }),
  component: PurchaseOrders,
})
