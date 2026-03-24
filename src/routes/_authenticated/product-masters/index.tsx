import { createFileRoute } from '@tanstack/react-router'
import { ProductMasters } from '@/features/product-masters'

export const Route = createFileRoute('/_authenticated/product-masters/')({
  component: ProductMasters,
})
