'use client'

import { useEffect, useRef } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/client/provider'
import { suppliersRepo } from '@/client'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { type Supplier } from '../data/schema'

const formSchema = z.object({
  name: z.string().min(1, 'Tên nhà cung cấp là bắt buộc.').max(255, 'Tên nhà cung cấp không được vượt quá 255 ký tự.'),
  phone: z.string().max(12, 'Số điện thoại không được vượt quá 12 ký tự.').optional(),
  representative: z.string().max(255, 'Tên người đại diện không được vượt quá 255 ký tự.').optional(),
  address: z.string().max(255, 'Địa chỉ không được vượt quá 255 ký tự.').optional(),
  description: z.string().max(1000, 'Mô tả không được vượt quá 1000 ký tự.').optional(),
  is_active: z.boolean(),
})

type SupplierForm = z.infer<typeof formSchema>

type SuppliersActionDialogProps = {
  currentRow?: Supplier
  open: boolean
  onOpenChange: (open: boolean) => void
}

const normalizeOptionalText = (value?: string) =>
  value && value.trim().length > 0 ? value.trim() : null

export function SuppliersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: SuppliersActionDialogProps) {
  const isEdit = !!currentRow
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()

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
      }
      : {
        name: '',
        phone: '',
        representative: '',
        address: '',
        description: '',
        is_active: true,
      },
  })

  const isOpenRef = useRef(open)

  const createMutation = useMutation({
    mutationFn: (values: SupplierForm) =>
      suppliersRepo.createSupplier({
        tenant_id: tenantId,
        name: values.name,
        phone: normalizeOptionalText(values.phone),
        representative: normalizeOptionalText(values.representative),
        address: normalizeOptionalText(values.address),
        description: normalizeOptionalText(values.description),
        is_active: values.is_active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', tenantId] })
      if (!isOpenRef.current) return
      form.reset()
      onOpenChange(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: SupplierForm) =>
      suppliersRepo.updateSupplier(currentRow!.id, {
        name: values.name,
        phone: normalizeOptionalText(values.phone),
        representative: normalizeOptionalText(values.representative),
        address: normalizeOptionalText(values.address),
        description: normalizeOptionalText(values.description),
        is_active: values.is_active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers', tenantId] })
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
      <DialogContent className='sm:max-w-lg'>
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
            className='space-y-4'
          >
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
            <FormField
              control={form.control}
              name='is_active'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Trạng thái</FormLabel>
                  <FormControl>
                    <div className='col-span-4 flex items-center gap-3'>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
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
