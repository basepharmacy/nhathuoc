import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { SupplierDetail } from '@/features/supplier-details'

export const Route = createFileRoute('/_authenticated/suppliers/$supplierId')({
  validateSearch: z.object({
    openPayment: z.boolean().optional().catch(undefined),
  }),
  component: SupplierDetail,
})
