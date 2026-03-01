import { createFileRoute } from '@tanstack/react-router'
import { CustomerDetail } from '@/features/customer-details'

export const Route = createFileRoute('/_authenticated/customers/$customerId')({
  component: CustomerDetail,
})
