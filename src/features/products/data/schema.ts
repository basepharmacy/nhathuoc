import { z } from 'zod'

export const productTypeValues = ['1_OTC', '2_PRESCRIPTION_REQUIRED', '9_OTHERS'] as const
export const productStatusValues = [
  '1_DRAFT',
  '2_ACTIVE',
  '3_INACTIVE',
  '4_ARCHIVED',
] as const

export const productTypeLabels: Record<(typeof productTypeValues)[number], string> = {
  '1_OTC': 'Bán tại quầy',
  '2_PRESCRIPTION_REQUIRED': 'Cần đơn',
  '9_OTHERS': 'Khác'
}

export const productStatusLabels: Record<(typeof productStatusValues)[number], string> = {
  '1_DRAFT': 'Nháp',
  '2_ACTIVE': 'Đang bán',
  '3_INACTIVE': 'Ngừng bán',
  '4_ARCHIVED': 'Lưu trữ',
}

export const unitNamePresets = [
  'Viên',
  'Vỉ',
  'Hộp',
  'Chai',
  'Gói',
  'Lọ',
  'Tuýp',
  'Ống',
  'Thùng',
] as const

export const productFormSchema = z.object({
  product_name: z
    .string()
    .min(1, 'Tên sản phẩm là bắt buộc.')
    .max(255, 'Tên sản phẩm không được vượt quá 255 ký tự.'),
  product_type: z.enum(productTypeValues),
  status: z.enum(productStatusValues),
  category_id: z.string().optional(),
  has_expiry: z.boolean(),
  min_stock: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) return null
      const numberValue = Number(value)
      return Number.isNaN(numberValue) ? null : numberValue
    },
    z
      .number()
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
  units: z
    .array(
      z.object({
        id: z.string().optional(),
        unit_name: z
          .string()
          .min(1, 'Đơn vị là bắt buộc.')
          .max(50, 'Đơn vị không được vượt quá 50 ký tự.'),
        conversion_factor: z.preprocess(
          (value) => {
            if (value === '' || value === null || value === undefined) return 0
            const numberValue = Number(value)
            return Number.isNaN(numberValue) ? 0 : numberValue
          },
          z
            .number()
            .min(1, 'Hệ số quy đổi phải lớn hơn hoặc bằng 1.')
        ),
        cost_price: z.preprocess(
          (value) => {
            if (value === '' || value === null || value === undefined) return null
            const numberValue = Number(value)
            return Number.isNaN(numberValue) ? null : numberValue
          },
          z
            .number()
            .min(0, 'Giá nhập không được âm.')
            .nullable()
        ),
        sell_price: z.preprocess(
          (value) => {
            if (value === '' || value === null || value === undefined) return null
            const numberValue = Number(value)
            return Number.isNaN(numberValue) ? null : numberValue
          },
          z
            .number()
            .min(0, 'Giá bán không được âm.')
            .nullable()
        ),
        is_base_unit: z.boolean().optional(),
      })
    )
    .min(1, 'Cần ít nhất một đơn vị.')
    // Trùng tên đơn vị trong cùng sản phẩm gây nhập nhằng khi chọn đơn vị lúc
    // bán / nhập hàng, và nhân bản dòng ở các báo cáo join theo đơn vị cơ bản.
    .superRefine((units, ctx) => {
      const seen = new Map<string, number>()
      units.forEach((unit, index) => {
        const key = unit.unit_name.trim().toLowerCase()
        if (!key) return
        if (seen.has(key)) {
          ctx.addIssue({
            code: 'custom',
            path: [index, 'unit_name'],
            message: 'Tên đơn vị bị trùng với đơn vị khác của sản phẩm.',
          })
          return
        }
        seen.set(key, index)
      })
    }),
})

export type ProductForm = z.infer<typeof productFormSchema>

/**
 * Form đổi đơn vị cơ bản sang một đơn vị NHỎ HƠN.
 *
 * Tồn kho được lưu theo đơn vị cơ bản nên khi đổi, toàn bộ số lượng phải nhân
 * với hệ số. Chỉ cho phép đi xuống đơn vị nhỏ hơn để kết quả luôn là số nguyên.
 */
export const rebaseBaseUnitFormSchema = z.object({
  unit_name: z
    .string()
    .min(1, 'Tên đơn vị là bắt buộc.')
    .max(50, 'Đơn vị không được vượt quá 50 ký tự.'),
  factor: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) return Number.NaN
      const numberValue = Number(value)
      return Number.isNaN(numberValue) ? Number.NaN : numberValue
    },
    z
      .number({ message: 'Hệ số quy đổi là bắt buộc.' })
      .int('Hệ số quy đổi phải là số nguyên.')
      .min(2, 'Đơn vị mới phải nhỏ hơn đơn vị cơ bản hiện tại (hệ số từ 2 trở lên).')
  ),
  cost_price: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) return null
      const numberValue = Number(value)
      return Number.isNaN(numberValue) ? null : numberValue
    },
    z.number().min(0, 'Giá nhập không được âm.').nullable()
  ),
  sell_price: z.preprocess(
    (value) => {
      if (value === '' || value === null || value === undefined) return null
      const numberValue = Number(value)
      return Number.isNaN(numberValue) ? null : numberValue
    },
    z.number().min(0, 'Giá bán không được âm.').nullable()
  ),
})

export type RebaseBaseUnitForm = z.infer<typeof rebaseBaseUnitFormSchema>
