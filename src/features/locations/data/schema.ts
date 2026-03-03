import { z } from 'zod'

export const locationTypeValues = ['1_WAREHOUSE', '2_STORE', '9_OTHER'] as const
export const locationStatusValues = ['1_ACTIVE', '2_INACTIVE', '3_CLOSED'] as const

export const locationTypeLabels: Record<(typeof locationTypeValues)[number], string> = {
  '1_WAREHOUSE': 'Kho',
  '2_STORE': 'Cửa hàng',
  '9_OTHER': 'Khác',
}

export const locationStatusLabels: Record<(typeof locationStatusValues)[number], string> = {
  '1_ACTIVE': 'Hoạt động',
  '2_INACTIVE': 'Ngừng hoạt động',
  '3_CLOSED': 'Đã đóng',
}

export const locationFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên cửa hàng là bắt buộc.')
    .max(255, 'Tên cửa hàng không được vượt quá 255 ký tự.'),
  type: z.enum(locationTypeValues),
  status: z.enum(locationStatusValues),
  address: z
    .string()
    .max(500, 'Địa chỉ không được vượt quá 500 ký tự.')
    .optional(),
  phone: z
    .string()
    .max(20, 'Số điện thoại không được vượt quá 20 ký tự.')
    .optional(),
  description: z
    .string()
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự.')
    .optional(),
})

export type LocationForm = z.infer<typeof locationFormSchema>
