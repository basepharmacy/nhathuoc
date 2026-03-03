'use client'

import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { useUser } from '@/client/provider'
import { locationsRepo } from '@/client'
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
import { cn } from '@/lib/utils'
import {
  type LocationForm,
  locationFormSchema,
  locationTypeLabels,
  locationStatusLabels,
} from '../data/schema'
import { type Location } from '@/services/supabase'

type LocationsActionDialogProps = {
  currentRow?: Location
  open: boolean
  onOpenChange: (open: boolean) => void
}

type LocationFormInput = z.input<typeof locationFormSchema>

const normalizeOptionalText = (value?: string) =>
  value && value.trim().length > 0 ? value.trim() : null

export function LocationsActionDialog({
  currentRow,
  open,
  onOpenChange,
}: LocationsActionDialogProps) {
  const isEdit = !!currentRow
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()

  const form = useForm<LocationFormInput, unknown, LocationForm>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: isEdit
      ? {
        name: currentRow.name,
        type: currentRow.type,
        status: currentRow.status,
        address: currentRow.address ?? '',
        phone: currentRow.phone ?? '',
        description: currentRow.description ?? '',
      }
      : {
        name: '',
        type: '2_STORE',
        status: '1_ACTIVE',
        address: '',
        phone: '',
        description: '',
      },
  })

  const isOpenRef = useRef(open)

  const createMutation = useMutation({
    mutationFn: (values: LocationForm) =>
      locationsRepo.createLocation({
        tenant_id: tenantId,
        name: values.name,
        type: values.type,
        status: values.status,
        address: normalizeOptionalText(values.address),
        phone: normalizeOptionalText(values.phone),
        description: normalizeOptionalText(values.description),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', tenantId] })
      if (!isOpenRef.current) return
      form.reset()
      onOpenChange(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: LocationForm) =>
      locationsRepo.updateLocation(currentRow!.id, {
        name: values.name,
        type: values.type,
        status: values.status,
        address: normalizeOptionalText(values.address),
        phone: normalizeOptionalText(values.phone),
        description: normalizeOptionalText(values.description),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', tenantId] })
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

  const onSubmit = (values: LocationForm) => {
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
      <DialogContent className='sm:max-w-2xl max-h-[85vh] overflow-hidden'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa cửa hàng' : 'Thêm cửa hàng mới'}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? 'Cập nhật thông tin cửa hàng. ' : 'Tạo cửa hàng mới. '}
            Nhấn lưu khi hoàn tất.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='location-form'
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
                          placeholder='Tên cửa hàng...'
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
                  name='type'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 pt-2 text-end'>Loại</FormLabel>
                      <FormControl>
                        <div className='col-span-4 flex flex-wrap gap-2'>
                          {Object.entries(locationTypeLabels).map(
                            ([value, label]) => (
                              <button
                                key={value}
                                type='button'
                                onClick={() => field.onChange(value)}
                                className={cn(
                                  'rounded-full border px-3 py-1 text-sm font-medium transition-colors',
                                  field.value === value
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-input bg-background text-foreground hover:bg-muted'
                                )}
                                aria-pressed={field.value === value}
                              >
                                {label}
                              </button>
                            )
                          )}
                        </div>
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>Địa chỉ</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Địa chỉ...'
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
                      <FormLabel className='col-span-2 text-end'>Điện thoại</FormLabel>
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
                  name='description'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 pt-2 text-end'>Mô tả</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder='Mô tả cửa hàng...'
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
                  name='status'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 pt-2 text-end'>Trạng thái</FormLabel>
                      <FormControl>
                        <div className='col-span-4 flex flex-wrap gap-2'>
                          {Object.entries(locationStatusLabels).map(
                            ([value, label]) => (
                              <button
                                key={value}
                                type='button'
                                onClick={() => field.onChange(value)}
                                className={cn(
                                  'rounded-full border px-3 py-1 text-sm font-medium transition-colors',
                                  field.value === value
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-input bg-background text-foreground hover:bg-muted'
                                )}
                                aria-pressed={field.value === value}
                              >
                                {label}
                              </button>
                            )
                          )}
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
        <DialogFooter className='gap-2'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type='submit' form='location-form' disabled={isPending}>
            {isEdit ? 'Lưu' : 'Thêm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
