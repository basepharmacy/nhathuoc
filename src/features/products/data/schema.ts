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

export const productFormSchema = z.object({
  product_name: z
    .string()
    .min(1, 'Tên sản phẩm là bắt buộc.')
    .max(255, 'Tên sản phẩm không được vượt quá 255 ký tự.'),
  product_type: z.enum(productTypeValues),
  status: z.enum(productStatusValues),
  category_id: z.string().optional(),
  min_stock: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) return null
      const numberValue = Number(value)
      return Number.isNaN(numberValue) ? null : numberValue
    },
    z
      .number({ invalid_type_error: 'Tồn tối thiểu phải là số.' })
      .min(0, 'Tồn tối thiểu không được âm.')
      .nullable()
  ),
  active_ingredient: z
    .string()
    .max(255, 'Hoạt chất không được vượt quá 255 ký tự.')
    .optional(),
  regis_number: z
    .string()
    .max(255, 'Số đăng ký không được vượt quá 255 ký tự.')
    .optional(),
  jan_code: z
    .string()
    .max(255, 'Mã JAN không được vượt quá 255 ký tự.')
    .optional(),
  made_company_name: z
    .string()
    .max(255, 'Nhà sản xuất không được vượt quá 255 ký tự.')
    .optional(),
  sale_company_name: z
    .string()
    .max(255, 'Nhà phân phối không được vượt quá 255 ký tự.')
    .optional(),
  description: z
    .string()
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự.')
    .optional(),
})

export type ProductForm = z.infer<typeof productFormSchema>
