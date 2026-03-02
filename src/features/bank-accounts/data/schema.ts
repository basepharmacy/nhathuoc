import { z } from 'zod'

export const bankAccountSchema = z.object({
  id: z.string(),
  tenant_id: z.string(),
  bank_bin: z.string(),
  account_number: z.string(),
  account_holder: z.string(),
  is_default: z.boolean().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
})
export type BankAccount = z.infer<typeof bankAccountSchema>

export const bankAccountFormSchema = z.object({
  bank_bin: z.string().min(1, 'Vui lòng chọn ngân hàng.'),
  account_number: z
    .string()
    .min(1, 'Số tài khoản là bắt buộc.')
    .max(32, 'Số tài khoản tối đa 32 ký tự.'),
  account_holder: z
    .string()
    .min(1, 'Tên chủ tài khoản là bắt buộc.')
    .max(255, 'Tên chủ tài khoản tối đa 255 ký tự.'),
  is_default: z.boolean().optional(),
})
export type BankAccountForm = z.infer<typeof bankAccountFormSchema>
