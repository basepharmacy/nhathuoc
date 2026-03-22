import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { PurchaseOrderDetail } from '@/features/purchase-order-detail'

export const Route = createFileRoute('/_authenticated/purchase-orders/detail')({
  validateSearch: z.object({
    orderCode: z.string().optional().catch(undefined),
  }),
  component: PurchaseOrderDetail,
})
