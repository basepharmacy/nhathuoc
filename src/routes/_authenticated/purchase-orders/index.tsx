import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { PurchaseOrders } from '@/features/purchase-orders'

export const Route = createFileRoute('/_authenticated/purchase-orders/')({
  validateSearch: z.object({
    orderCode: z.string().optional().catch(undefined),
    productId: z.string().optional().catch(undefined),
    suggestedQty: z.coerce.number().optional().catch(undefined),
    quickOrderSupplierId: z.string().optional().catch(undefined),
  }),
  component: PurchaseOrders,
})
