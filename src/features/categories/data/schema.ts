import { z } from 'zod'

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  tenant_id: z.string(),
  active_products_count: z.number().int().nonnegative().default(0),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})
export type Category = z.infer<typeof categorySchema>

export const categoryListSchema = z.array(categorySchema)

export const categoryFormSchema = z.object({
  name: z.string().min(1, 'Tên danh mục là bắt buộc.'),
  description: z.string().optional(),
})
