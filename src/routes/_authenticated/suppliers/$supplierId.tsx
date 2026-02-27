import { createFileRoute } from '@tanstack/react-router'
import { SupplierDetail } from '@/features/supplier-details'

export const Route = createFileRoute('/_authenticated/suppliers/$supplierId')({
  component: SupplierDetail,
})
