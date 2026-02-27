import { z } from 'zod'

export const customerSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  description: z.string().nullable(),
  location_id: z.string().nullable(),
  tenant_id: z.string(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})

export type Customer = z.infer<typeof customerSchema>

export const customerListSchema = z.array(customerSchema)
