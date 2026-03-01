'use client'

import { useEffect, useMemo, useRef } from 'react'
import { z } from 'zod'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { type VietQrBank } from '@/client/queries'
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CheckIcon, CaretSortIcon } from '@radix-ui/react-icons'
import { Plus, Trash2 } from 'lucide-react'
import { type SupplierBankAccount } from '@/services/supabase'
import { type Supplier } from '../data/schema'

const formSchema = z.object({
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

type SupplierForm = z.infer<typeof formSchema>

type MutationOptions = {
  onSuccess?: () => void
}

type SupplierActionMutation = {
  mutate: (values: SupplierForm, options?: MutationOptions) => void
  isPending: boolean
  error: unknown
  reset: () => void
}

type SuppliersActionDialogProps = {
  currentRow?: Supplier
  open: boolean
  onOpenChange: (open: boolean) => void
  banks: VietQrBank[]
  isBanksLoading: boolean
  supplierBankAccounts: SupplierBankAccount[]
  isBankAccountsLoading: boolean
  createMutation: SupplierActionMutation
  updateMutation: SupplierActionMutation
}

export function SuppliersActionDialog({
  currentRow,
  open,
  onOpenChange,
  banks,
  isBanksLoading,
  supplierBankAccounts,
  isBankAccountsLoading,
  createMutation,
  updateMutation,
}: SuppliersActionDialogProps) {
  const isEdit = !!currentRow

  const form = useForm<SupplierForm>({
    resolver: zodResolver(formSchema),
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

  const bankOptions = useMemo(() => {
    const safeBanks = Array.isArray(banks) ? banks : []
    return [...safeBanks].sort((left, right) =>
      (left.shortName ?? left.name).localeCompare(
        right.shortName ?? right.name,
        'vi'
      )
    )
  }, [banks])

  const bankByBin = useMemo(
    () => new Map(bankOptions.map((bank) => [bank.bin, bank])),
    [bankOptions]
  )

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

  useEffect(() => {
    isOpenRef.current = open
    if (open) {
      createMutation.reset()
      updateMutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const handleSuccess = () => {
    if (!isOpenRef.current) return
    form.reset()
    onOpenChange(false)
  }

  const onSubmit = (values: SupplierForm) => {
    if (isEdit) {
      updateMutation.mutate(values, { onSuccess: handleSuccess })
    } else {
      createMutation.mutate(values, { onSuccess: handleSuccess })
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
                                      <Popover>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant='outline'
                                            role='combobox'
                                            className={cn(
                                              'w-full justify-between',
                                              !field.value && 'text-muted-foreground'
                                            )}
                                          >
                                            {field.value
                                              ? bankByBin.get(field.value)?.shortName ??
                                                bankByBin.get(field.value)?.name ??
                                                'Chọn ngân hàng'
                                              : 'Chọn ngân hàng'}
                                            <CaretSortIcon className='ms-2 h-4 w-4 shrink-0 opacity-50' />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent
                                          className='w-[320px] p-0 max-h-[320px] overflow-hidden'
                                          onWheel={(event) => event.stopPropagation()}
                                          onTouchMove={(event) => event.stopPropagation()}
                                        >
                                          <Command>
                                            <CommandInput placeholder='Tìm ngân hàng...' />
                                            <CommandEmpty>Không tìm thấy ngân hàng.</CommandEmpty>
                                            <CommandGroup>
                                              <CommandList className='max-h-[240px] overflow-y-auto'>
                                                {isBanksLoading ? (
                                                  <CommandItem value='loading' disabled>
                                                    Đang tải ngân hàng...
                                                  </CommandItem>
                                                ) : bankOptions.length ? (
                                                  bankOptions.map((bank) => (
                                                    <CommandItem
                                                      key={bank.bin}
                                                      value={`${bank.shortName ?? bank.name} ${bank.code}`}
                                                      onSelect={() =>
                                                        field.onChange(bank.bin)
                                                      }
                                                    >
                                                      <CheckIcon
                                                        className={cn(
                                                          'size-4',
                                                          bank.bin === field.value
                                                            ? 'opacity-100'
                                                            : 'opacity-0'
                                                        )}
                                                      />
                                                      {bank.shortName ?? bank.name}
                                                    </CommandItem>
                                                  ))
                                                ) : (
                                                  <CommandItem value='empty' disabled>
                                                    Không có dữ liệu ngân hàng.
                                                  </CommandItem>
                                                )}
                                              </CommandList>
                                            </CommandGroup>
                                          </Command>
                                        </PopoverContent>
                                      </Popover>
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
