import { createFileRoute } from '@tanstack/react-router'
import { SupplierPaymentsHistory } from '@/features/supplier-payments-history'

export const Route = createFileRoute('/_authenticated/supplier-payments/history')({
  component: SupplierPaymentsHistory,
})
