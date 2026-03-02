'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { useUser } from '@/client/provider'
import { supplierBankAccountsRepo, supplierPaymentsRepo } from '@/client'
import { getSupplierBankAccountsQueryOptions } from '@/client/queries'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BankCombobox, bankByBin } from '@/components/bank-combobox'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { formatCurrency, normalizeNumber } from '@/lib/utils'
import {
  supplierPaymentFormSchema,
  type SupplierPaymentForm,
  type Supplier,
} from '../data/schema'

const normalizeOptionalText = (value?: string) =>
  value && value.trim().length > 0 ? value.trim() : null

const getTodayDate = () => new Date().toISOString().slice(0, 10)

function buildVietQrUrl(
  bankBin: string,
  accountNumber: string,
  accountHolder: string,
  amount: string,
  note?: string
) {
  const numericAmount = Number(amount)
  const safeAmount = Number.isFinite(numericAmount) && numericAmount > 0 ? numericAmount : 0
  const params = new URLSearchParams()
  if (safeAmount > 0) params.set('amount', String(safeAmount))
  if (note) params.set('addInfo', note)
  params.set('accountName', accountHolder)
  return `https://img.vietqr.io/image/${bankBin}-${accountNumber}-compact2.png?${params.toString()}`
}

const addBankAccountSchema = z.object({
  bank_bin: z.string().min(1, 'Vui lòng chọn ngân hàng.'),
  account_number: z.string().min(1, 'Số tài khoản là bắt buộc.').max(32),
  account_holder: z.string().min(1, 'Tên chủ tài khoản là bắt buộc.').max(255),
})

type AddBankAccountForm = z.infer<typeof addBankAccountSchema>

function AddBankAccountInline({
  supplierId,
  tenantId,
  onSuccess,
}: {
  supplierId: string
  tenantId: string
  onSuccess: () => void
}) {
  const queryClient = useQueryClient()
  const form = useForm<AddBankAccountForm>({
    resolver: zodResolver(addBankAccountSchema),
    defaultValues: { bank_bin: '', account_number: '', account_holder: '' },
  })

  const mutation = useMutation({
    mutationFn: (values: AddBankAccountForm) =>
      supplierBankAccountsRepo.replaceSupplierBankAccounts({
        supplierId,
        tenantId,
        accounts: [{
          bank_bin: values.bank_bin.trim(),
          account_number: values.account_number.replace(/\s+/g, ''),
          account_holder: values.account_holder.trim(),
          is_default: true,
        }],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-bank-accounts'] })
      form.reset()
      onSuccess()
    },
    onError: () => {
      toast.error('Không thể thêm tài khoản ngân hàng.')
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className='space-y-3'
      >
        <FormField
          control={form.control}
          name='bank_bin'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ngân hàng</FormLabel>
              <FormControl>
                <BankCombobox value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='account_number'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số tài khoản</FormLabel>
              <FormControl>
                <Input placeholder='Số tài khoản...' inputMode='numeric' autoComplete='off' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='account_holder'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chủ tài khoản</FormLabel>
              <FormControl>
                <Input placeholder='Tên chủ tài khoản...' autoComplete='off' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' size='sm' className='w-full' disabled={mutation.isPending}>
          {mutation.isPending ? 'Đang lưu...' : 'Lưu tài khoản'}
        </Button>
      </form>
    </Form>
  )
}

type SuppliersPaymentDialogProps = {
  currentRow?: Supplier
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SuppliersPaymentDialog({
  currentRow,
  open,
  onOpenChange,
}: SuppliersPaymentDialogProps) {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()
  const isOpenRef = useRef(open)
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [showAddBank, setShowAddBank] = useState(false)

  const { data: bankAccounts = [] } = useQuery({
    ...getSupplierBankAccountsQueryOptions(currentRow?.id ?? ''),
    enabled: !!currentRow?.id,
  })

  const selectedAccount = useMemo(() => {
    if (!bankAccounts.length) return null
    if (selectedAccountId) {
      const found = bankAccounts.find((a) => a.id === selectedAccountId)
      if (found) return found
    }
    return bankAccounts.find((a) => a.is_default) ?? bankAccounts[0]
  }, [bankAccounts, selectedAccountId])

  useEffect(() => {
    if (open) {
      setSelectedAccountId(null)
      setShowAddBank(false)
    }
  }, [open])

  const defaultValues = useMemo(
    () => ({
      amount: '',
      payment_date: getTodayDate(),
      reference_code: '',
      note: '',
    }),
    []
  )

  const form = useForm<SupplierPaymentForm>({
    resolver: zodResolver(supplierPaymentFormSchema),
    defaultValues,
  })

  const watchedAmount = useWatch({ control: form.control, name: 'amount' })
  const watchedNote = useWatch({ control: form.control, name: 'note' })

  const qrUrl = useMemo(() => {
    if (!selectedAccount) return null
    return buildVietQrUrl(
      selectedAccount.bank_bin,
      selectedAccount.account_number,
      selectedAccount.account_holder,
      watchedAmount ?? '',
      watchedNote
    )
  }, [selectedAccount, watchedAmount, watchedNote])

  const createMutation = useMutation({
    mutationFn: (values: SupplierPaymentForm) => {
      if (!tenantId) {
        throw new Error('Không tìm thấy tenant.')
      }
      if (!currentRow) {
        throw new Error('Không tìm thấy nhà cung cấp.')
      }
      return supplierPaymentsRepo.createSupplierPayment({
        tenant_id: tenantId,
        supplier_id: currentRow.id,
        amount: Number(values.amount),
        payment_date: values.payment_date,
        reference_code: normalizeOptionalText(values.reference_code),
        note: normalizeOptionalText(values.note),
        is_payment_on_purchase_order: false,
      })
    },
    onSuccess: () => {
      if (!currentRow) return
      queryClient.invalidateQueries({
        queryKey: ['supplier-payments', tenantId, currentRow.id],
      })
      queryClient.invalidateQueries({
        queryKey: ['supplier-payments', tenantId, currentRow.id, 'history'],
      })
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      if (!isOpenRef.current) return
      form.reset({
        ...defaultValues,
        payment_date: getTodayDate(),
      })
      onOpenChange(false)
    },
    onError: (error) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Đã xảy ra lỗi, vui lòng thử lại.'
      toast.error(message)
    },
  })

  useEffect(() => {
    isOpenRef.current = open
    if (open) {
      createMutation.reset()
      form.reset({
        ...defaultValues,
        payment_date: getTodayDate(),
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onSubmit = (values: SupplierPaymentForm) => {
    createMutation.mutate(values)
  }

  const hasBankAccounts = bankAccounts.length > 0
  const showRightPanel = hasBankAccounts || showAddBank

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset({
          ...defaultValues,
          payment_date: getTodayDate(),
        })
        onOpenChange(state)
      }}
    >
      <DialogContent className={showRightPanel ? 'sm:max-w-3xl' : 'sm:max-w-lg'}>
        <DialogHeader className='text-start'>
          <DialogTitle>Thanh toán nhà cung cấp</DialogTitle>
          <DialogDescription>
            {currentRow
              ? `Ghi nhận thanh toán cho ${currentRow.name}.`
              : 'Ghi nhận thanh toán cho nhà cung cấp.'}{' '}
            Nhấn lưu khi hoàn tất.
          </DialogDescription>
        </DialogHeader>
        <div className={showRightPanel ? 'grid grid-cols-1 gap-6 sm:grid-cols-2' : ''}>
          <Form {...form}>
            <form
              id='supplier-payment-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
            >
              <FormField
                control={form.control}
                name='amount'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Số tiền</FormLabel>
                    <FormControl>
                      <Input
                        min={0}
                        step='1'
                        placeholder='Số tiền thanh toán...'
                        className='col-span-4'
                        autoComplete='off'
                        inputMode='numeric'
                        {...field}
                        value={formatCurrency(field.value, { fallback: '' })}
                        onChange={(event) => {
                          const rawValue = event.target.value
                          if (!rawValue) {
                            field.onChange('')
                            return
                          }
                          field.onChange(String(normalizeNumber(rawValue)))
                        }}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='payment_date'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Ngày thanh toán</FormLabel>
                    <FormControl>
                      <Input
                        type='date'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='reference_code'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>Mã tham chiếu</FormLabel>
                    <FormControl>
                      <Input
                        placeholder='Mã tham chiếu...'
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='note'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 pt-2 text-end'>Ghi chú</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder='Ghi chú thanh toán...'
                        className='col-span-4 resize-none'
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              {!showRightPanel && (
                <div className='pt-2'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='w-full gap-2'
                    onClick={() => setShowAddBank(true)}
                  >
                    <Plus className='size-4' />
                    Thêm tài khoản ngân hàng để tạo QR
                  </Button>
                </div>
              )}
            </form>
          </Form>

          {showRightPanel && (
            <div className='flex flex-col items-center gap-4'>
              <Separator className='sm:hidden' />
              {hasBankAccounts && (
                <Select
                  value={showAddBank ? '__add_new__' : selectedAccount?.id ?? ''}
                  onValueChange={(value) => {
                    if (value === '__add_new__') {
                      setShowAddBank(true)
                    } else {
                      setShowAddBank(false)
                      setSelectedAccountId(value)
                    }
                  }}
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Chọn tài khoản' />
                  </SelectTrigger>
                  <SelectContent>
                    {bankAccounts.map((account) => {
                      const bank = bankByBin.get(account.bank_bin)
                      return (
                        <SelectItem key={account.id} value={account.id}>
                          {bank?.shortName ?? bank?.name ?? account.bank_bin} - {account.account_number}
                        </SelectItem>
                      )
                    })}
                    <SelectItem value='__add_new__'>
                      <span className='flex items-center gap-1.5'>
                        <Plus className='size-3.5' />
                        Thêm tài khoản mới
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
              {showAddBank && currentRow ? (
                <div className='w-full'>
                  <p className='mb-3 text-sm font-medium'>Thêm tài khoản ngân hàng</p>
                  <AddBankAccountInline
                    supplierId={currentRow.id}
                    tenantId={tenantId}
                    onSuccess={() => setShowAddBank(false)}
                  />
                </div>
              ) : selectedAccount ? (
                <>
                  {qrUrl && (
                    <img
                      src={qrUrl}
                      alt='QR chuyển khoản'
                      width={220}
                      height={220}
                      className='rounded-lg border'
                    />
                  )}
                  <div className='w-full space-y-1 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Ngân hàng</span>
                      <span className='font-medium'>
                        {bankByBin.get(selectedAccount.bank_bin)?.shortName
                          ?? bankByBin.get(selectedAccount.bank_bin)?.name
                          ?? selectedAccount.bank_bin}
                      </span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Số tài khoản</span>
                      <span className='font-medium'>{selectedAccount.account_number}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-muted-foreground'>Chủ tài khoản</span>
                      <span className='font-medium'>{selectedAccount.account_holder}</span>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type='submit'
            form='supplier-payment-form'
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
