'use client'

import { useEffect, useRef } from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/client/provider'
import { supplierBankAccountsRepo, suppliersRepo } from '@/client'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { BankCombobox } from '@/components/bank-combobox'
import { Plus, Trash2 } from 'lucide-react'
import {
  supplierFormSchema,
  type SupplierForm,
  type Supplier,
} from '../data/schema'

const normalizeOptionalText = (value?: string) =>
  value && value.trim().length > 0 ? value.trim() : null

const normalizeBankAccounts = (
  accounts?: SupplierForm['bank_accounts']
) => {
  const normalized = (accounts ?? []).map((account) => ({
    bank_bin: account.bank_bin.trim(),
    account_number: account.account_number.replace(/\s+/g, ''),
    account_holder: account.account_holder.trim(),
    is_default: Boolean(account.is_default),
  }))

  if (!normalized.length) return []

  let defaultIndex = normalized.findIndex((account) => account.is_default)
  if (defaultIndex < 0) defaultIndex = 0

  return normalized.map((account, index) => ({
    ...account,
    is_default: index === defaultIndex,
  }))
}

type SuppliersActionDialogProps = {
  currentRow?: Supplier
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SuppliersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: SuppliersActionDialogProps) {
  const isEdit = !!currentRow
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()

  const { data: supplierBankAccounts = [], isLoading: isBankAccountsLoading } =
    useQuery({
      ...getSupplierBankAccountsQueryOptions(currentRow?.id ?? ''),
      enabled: isEdit && !!currentRow?.id,
    })

  const form = useForm<SupplierForm>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: isEdit
      ? {
        name: currentRow.name,
        phone: currentRow.phone ?? '',
        representative: currentRow.representative ?? '',
        address: currentRow.address ?? '',
        description: currentRow.description ?? '',
        is_active: currentRow.is_active ?? true,
        bank_accounts: [],
      }
      : {
        name: '',
        phone: '',
        representative: '',
        address: '',
        description: '',
        is_active: true,
        bank_accounts: [],
      },
  })

  const {
    fields: bankAccountFields,
    append: appendBankAccount,
    remove: removeBankAccount,
    replace: replaceBankAccounts,
  } = useFieldArray({
    control: form.control,
    name: 'bank_accounts',
  })

  const bankAccountsWatch = useWatch({
    control: form.control,
    name: 'bank_accounts',
  })

  const isOpenRef = useRef(open)

  useEffect(() => {
    if (!isEdit || !currentRow?.id || !open) return
    if (isBankAccountsLoading) return
    const normalizedAccounts = supplierBankAccounts.length
      ? [...supplierBankAccounts]
        .sort(
          (left, right) =>
            Number(right.is_default) - Number(left.is_default)
        )
        .map((account) => ({
          bank_bin: account.bank_bin,
          account_number: account.account_number,
          account_holder: account.account_holder,
          is_default: account.is_default ?? false,
        }))
      : []

    form.setValue('bank_accounts', normalizedAccounts, { shouldDirty: false })
  }, [
    currentRow?.id,
    form,
    isBankAccountsLoading,
    isEdit,
    open,
    supplierBankAccounts,
  ])

  const handleDefaultBankAccount = (index: number) => {
    const accounts = form.getValues('bank_accounts') ?? []
    accounts.forEach((_, accountIndex) => {
      form.setValue(
        `bank_accounts.${accountIndex}.is_default`,
        accountIndex === index,
        { shouldDirty: true }
      )
    })
  }

  const handleRemoveBankAccount = (index: number) => {
    const accounts = form.getValues('bank_accounts') ?? []
    const remaining = accounts.filter((_, accountIndex) => accountIndex !== index)

    if (!remaining.length) {
      removeBankAccount(index)
      return
    }

    let defaultIndex = remaining.findIndex((account) => account.is_default)
    if (defaultIndex < 0) defaultIndex = 0

    const normalized = remaining.map((account, accountIndex) => ({
      ...account,
      is_default: accountIndex === defaultIndex,
    }))

    replaceBankAccounts(normalized)
  }

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['suppliers'] })
    queryClient.invalidateQueries({ queryKey: ['supplier-bank-accounts'] })
  }

  const createMutation = useMutation({
    mutationFn: async (values: SupplierForm) => {
      const supplier = await suppliersRepo.createSupplier({
        tenant_id: tenantId,
        name: values.name,
        phone: normalizeOptionalText(values.phone),
        representative: normalizeOptionalText(values.representative),
        address: normalizeOptionalText(values.address),
        description: normalizeOptionalText(values.description),
        is_active: values.is_active,
      })

      const accounts = normalizeBankAccounts(values.bank_accounts)
      await supplierBankAccountsRepo.replaceSupplierBankAccounts({
        supplierId: supplier.id,
        tenantId,
        accounts,
      })

      return supplier
    },
    onSuccess: () => {
      invalidateQueries()
      if (!isOpenRef.current) return
      form.reset()
      onOpenChange(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: async (values: SupplierForm) => {
      if (!currentRow) {
        throw new Error('Không tìm thấy nhà cung cấp.')
      }
      const supplier = await suppliersRepo.updateSupplier(currentRow.id, {
        name: values.name,
        phone: normalizeOptionalText(values.phone),
        representative: normalizeOptionalText(values.representative),
        address: normalizeOptionalText(values.address),
        description: normalizeOptionalText(values.description),
        is_active: values.is_active,
      })

      const accounts = normalizeBankAccounts(values.bank_accounts)
      await supplierBankAccountsRepo.replaceSupplierBankAccounts({
        supplierId: currentRow.id,
        tenantId,
        accounts,
      })

      return supplier
    },
    onSuccess: () => {
      invalidateQueries()
      if (!isOpenRef.current) return
      form.reset()
      onOpenChange(false)
    },
  })

  useEffect(() => {
    isOpenRef.current = open
    if (open) {
      createMutation.reset()
      updateMutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onSubmit = (values: SupplierForm) => {
    if (isEdit) {
      updateMutation.mutate(values)
    } else {
      createMutation.mutate(values)
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending
  const mutationError = createMutation.error ?? updateMutation.error
  const errorMessage =
    mutationError && typeof mutationError === 'object' && 'message' in mutationError
      ? String((mutationError as { message: string }).message)
      : mutationError
        ? 'Đã xảy ra lỗi, vui lòng thử lại.'
        : null

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-4xl max-h-[85vh] overflow-hidden'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Cập nhật thông tin nhà cung cấp. ' : 'Tạo nhà cung cấp mới. '}
            Nhấn lưu khi hoàn tất.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='supplier-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex max-h-[70vh] flex-col'
          >
            <ScrollArea className='max-h-[60vh] pr-3'>
              <div className='space-y-4 pb-2'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>Tên</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Tên nhà cung cấp...'
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
                  name='phone'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Số điện thoại...'
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
                  name='representative'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>Người đại diện</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Người đại diện...'
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
                  name='address'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 pt-2 text-end'>Địa chỉ</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Địa chỉ nhà cung cấp...'
                          className='col-span-4 resize-none'
                          rows={2}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='description'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 pt-2 text-end'>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Mô tả nhà cung cấp...'
                          className='col-span-4 resize-none'
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
                <div className='space-y-4'>
                  <div className='flex flex-wrap items-center justify-between gap-2'>
                    <div className='text-sm font-semibold text-end'>Tài khoản ngân hàng</div>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      className='gap-2'
                      onClick={() =>
                        appendBankAccount({
                          bank_bin: '',
                          account_number: '',
                          account_holder: '',
                          is_default: bankAccountFields.length === 0,
                        })
                      }
                    >
                      <Plus className='size-4' />
                      Thêm tài khoản
                    </Button>
                  </div>
                  <div className='space-y-4'>
                    {bankAccountFields.length === 0 ? (
                      <div className='rounded-lg border border-dashed p-4 text-sm text-muted-foreground'>
                        Chưa có tài khoản ngân hàng.
                      </div>
                    ) : (
                      bankAccountFields.map((bankField, index) => {
                        const isDefault = Boolean(
                          bankAccountsWatch?.[index]?.is_default
                        )
                        return (
                          <div
                            key={bankField.id}
                            className='rounded-lg border bg-muted/30 p-4 shadow-sm'
                          >
                            <div className='mt-2 grid grid-cols-1 items-start gap-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_auto] md:items-center'>
                              <FormField
                                control={form.control}
                                name={`bank_accounts.${index}.bank_bin`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <BankCombobox
                                        value={field.value ?? ''}
                                        onChange={field.onChange}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`bank_accounts.${index}.account_number`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        placeholder='Số tài khoản'
                                        inputMode='numeric'
                                        autoComplete='off'
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`bank_accounts.${index}.account_holder`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input
                                        placeholder='Tên chủ tài khoản'
                                        autoComplete='off'
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <div className='flex items-center justify-end gap-2 md:justify-start'>
                                <div className='flex items-center gap-2'>
                                  <Switch
                                    checked={isDefault}
                                    onCheckedChange={() => handleDefaultBankAccount(index)}
                                  />
                                  <span className='text-xs text-muted-foreground'>Mặc định</span>
                                </div>
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='icon'
                                  className='text-muted-foreground'
                                  onClick={() => handleRemoveBankAccount(index)}
                                  aria-label='Xóa tài khoản ngân hàng'
                                >
                                  <Trash2 className='size-4' />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name='is_active'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>Trạng thái</FormLabel>
                      <FormControl>
                        <div className='col-span-4 flex items-center gap-3'>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <span className='text-sm text-muted-foreground'>
                            {field.value ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
                {errorMessage && (
                  <Alert variant='destructive'>
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
              </div>
            </ScrollArea>
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='supplier-form' disabled={isPending}>
            {isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
