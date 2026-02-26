import { z } from 'zod'

export const supplierSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  representative: z.string().nullable(),
  description: z.string().nullable(),
  is_active: z.boolean().nullable(),
  tenant_id: z.string(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})

export type Supplier = z.infer<typeof supplierSchema>

export const supplierListSchema = z.array(supplierSchema)
