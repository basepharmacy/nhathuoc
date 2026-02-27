import { z } from 'zod'

export const productUnitSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  product_id: z.string(),
  unit_name: z.string(),
  sell_price: z.number(),
  cost_price: z.number(),
  conversion_factor: z.number(),
  created_at: z.string().nullable(),
})

export const productCategorySchema = z
  .object({
    name: z.string(),
  })
  .nullable()

export const productSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  category_id: z.string().nullable(),
  product_name: z.string(),
  jan_code: z.string().nullable(),
  description: z.string().nullable(),
  status: z.enum(['1_DRAFT', '2_ACTIVE', '3_INACTIVE', '4_ARCHIVED']),
  min_stock: z.number().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
  product_units: z.array(productUnitSchema),
  categories: productCategorySchema,
})

export type Product = z.infer<typeof productSchema>

export const productListSchema = z.array(productSchema)

export type ProductListFilterState = {
  keyword: string
  status: Product['status'][]
  category: string[]
}
