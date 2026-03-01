'use client'

import { useEffect, useMemo, useRef } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency, normalizeNumber } from '@/lib/utils'
import { type Supplier } from '../data/schema'

const formSchema = z.object({
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

type SupplierPaymentForm = z.infer<typeof formSchema>

type MutationOptions = {
  onSuccess?: () => void
}

type SupplierPaymentMutation = {
  mutate: (values: SupplierPaymentForm, options?: MutationOptions) => void
  isPending: boolean
  reset: () => void
}

type SuppliersPaymentDialogProps = {
  currentRow?: Supplier
  open: boolean
  onOpenChange: (open: boolean) => void
  createMutation: SupplierPaymentMutation
}

const getTodayDate = () => new Date().toISOString().slice(0, 10)

export function SuppliersPaymentDialog({
  currentRow,
  open,
  onOpenChange,
  createMutation,
}: SuppliersPaymentDialogProps) {
  const isOpenRef = useRef(open)

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
    resolver: zodResolver(formSchema),
    defaultValues,
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
    createMutation.mutate(values, {
      onSuccess: () => {
        if (!isOpenRef.current) return
        form.reset({
          ...defaultValues,
          payment_date: getTodayDate(),
        })
        onOpenChange(false)
      },
    })
  }

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
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>Thanh toán nhà cung cấp</DialogTitle>
          <DialogDescription>
            {currentRow
              ? `Ghi nhận thanh toán cho ${currentRow.name}.`
              : 'Ghi nhận thanh toán cho nhà cung cấp.'}{' '}
            Nhấn lưu khi hoàn tất.
          </DialogDescription>
        </DialogHeader>
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
          </form>
        </Form>
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
