'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/client/provider'
import { bankAccountsRepo } from '@/client'
import { BankCombobox } from '@/components/bank-combobox'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  bankAccountFormSchema,
  type BankAccount,
  type BankAccountForm,
} from '../data/schema'

type BankAccountsActionDialogProps = {
  currentRow?: BankAccount
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BankAccountsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: BankAccountsActionDialogProps) {
  const isEdit = !!currentRow
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()

  const form = useForm<BankAccountForm>({
    resolver: zodResolver(bankAccountFormSchema),
    defaultValues: isEdit
      ? {
          bank_bin: currentRow.bank_bin,
          account_number: currentRow.account_number,
          account_holder: currentRow.account_holder,
          is_default: currentRow.is_default ?? false,
        }
      : {
          bank_bin: '',
          account_number: '',
          account_holder: '',
          is_default: false,
        },
  })

  const isOpenRef = useRef(open)

  const createMutation = useMutation({
    mutationFn: (values: BankAccountForm) =>
      bankAccountsRepo.createBankAccount({
        tenant_id: tenantId,
        bank_bin: values.bank_bin,
        account_number: values.account_number,
        account_holder: values.account_holder,
        is_default: values.is_default ?? false,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts', tenantId] })
      if (!isOpenRef.current) return
      form.reset()
      onOpenChange(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: BankAccountForm) =>
      bankAccountsRepo.updateBankAccount(currentRow!.id, {
        bank_bin: values.bank_bin,
        account_number: values.account_number,
        account_holder: values.account_holder,
        is_default: values.is_default ?? false,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts', tenantId] })
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

  const onSubmit = (values: BankAccountForm) => {
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
      <DialogContent className='sm:max-w-md'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật thông tin tài khoản thanh toán. '
              : 'Tạo tài khoản thanh toán mới. '}
            Nhấn lưu khi hoàn tất.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='bank-account-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='bank_bin'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Ngân hàng</FormLabel>
                  <div className='col-span-4'>
                    <FormControl>
                      <BankCombobox
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='account_number'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Số tài khoản</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Nhập số tài khoản...'
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
              name='account_holder'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Chủ tài khoản</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='Tên chủ tài khoản...'
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
              name='is_default'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Mặc định</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            {errorMessage && (
              <Alert variant='destructive'>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='bank-account-form' disabled={isPending}>
            {isPending ? 'Đang lưu...' : 'Lưu'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
