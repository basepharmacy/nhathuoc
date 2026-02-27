import { z } from 'zod'

export const productTypeValues = ['1_OTC', '2_PRESCRIPTION_REQUIRED'] as const
export const productStatusValues = [
  '1_DRAFT',
  '2_ACTIVE',
  '3_INACTIVE',
  '4_ARCHIVED',
] as const

export const productSchema = z.object({
  id: z.string(),
  product_name: z.string(),
  product_type: z.enum(productTypeValues),
  status: z.enum(productStatusValues),
  category_id: z.string().nullable(),
  min_stock: z.number().nullable(),
  active_ingredient: z.string().nullable(),
  regis_number: z.string().nullable(),
  jan_code: z.string().nullable(),
  made_company_name: z.string().nullable(),
  sale_company_name: z.string().nullable(),
  description: z.string().nullable(),
  tenant_id: z.string(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})

export type Product = z.infer<typeof productSchema>

export const productListSchema = z.array(productSchema)
