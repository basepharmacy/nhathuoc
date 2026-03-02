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

export const supplierFormSchema = z.object({
  name: z.string().min(1, 'Tên nhà cung cấp là bắt buộc.').max(255, 'Tên nhà cung cấp không được vượt quá 255 ký tự.'),
  phone: z.string().max(12, 'Số điện thoại không được vượt quá 12 ký tự.').optional(),
  representative: z.string().max(255, 'Tên người đại diện không được vượt quá 255 ký tự.').optional(),
  address: z.string().max(255, 'Địa chỉ không được vượt quá 255 ký tự.').optional(),
  description: z.string().max(1000, 'Mô tả không được vượt quá 1000 ký tự.').optional(),
  is_active: z.boolean(),
  bank_accounts: z
    .array(
      z.object({
        bank_bin: z.string().min(1, 'Vui lòng chọn ngân hàng.'),
        account_number: z
          .string()
          .min(1, 'Số tài khoản là bắt buộc.')
          .max(32, 'Số tài khoản không được vượt quá 32 ký tự.'),
        account_holder: z
          .string()
          .min(1, 'Tên chủ tài khoản là bắt buộc.')
          .max(255, 'Tên chủ tài khoản không được vượt quá 255 ký tự.'),
        is_default: z.boolean().optional(),
      })
    )
    .optional(),
})

export type SupplierForm = z.infer<typeof supplierFormSchema>

export const supplierPaymentFormSchema = z.object({
  amount: z
    .string()
    .min(1, 'Số tiền thanh toán là bắt buộc.')
    .refine(
      (value) => {
        const numericValue = Number(value)
        return Number.isFinite(numericValue) && numericValue > 0
      },
      'Số tiền thanh toán phải lớn hơn 0.'
    ),
  payment_date: z.string().min(1, 'Ngày thanh toán là bắt buộc.'),
  reference_code: z
    .string()
    .max(255, 'Mã tham chiếu không được vượt quá 255 ký tự.')
    .optional(),
  note: z.string().max(1000, 'Ghi chú không được vượt quá 1000 ký tự.').optional(),
})

export type SupplierPaymentForm = z.infer<typeof supplierPaymentFormSchema>

export const addBankAccountSchema = z.object({
  bank_bin: z.string().min(1, 'Vui lòng chọn ngân hàng.'),
  account_number: z.string().min(1, 'Số tài khoản là bắt buộc.').max(32),
  account_holder: z.string().min(1, 'Tên chủ tài khoản là bắt buộc.').max(255),
})

export type AddBankAccountForm = z.infer<typeof addBankAccountSchema>
