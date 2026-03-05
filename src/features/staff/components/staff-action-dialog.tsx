'use client'

import { useEffect, useMemo, useRef } from 'react'
import { z } from 'zod'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useUser } from '@/client/provider'
import { getLocationsQueryOptions } from '@/client/queries'
import { profilesRepo, userAccountsRepo } from '@/client'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { PasswordInput } from '@/components/password-input'
import { Separator } from '@/components/ui/separator'
import { SelectDropdown } from '@/components/select-dropdown'
import { roles } from '../data/staff-data'
import { type StaffRole, type StaffUser } from '../data/staff-schema'

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên nhân viên là bắt buộc.')
    .max(255, 'Tên nhân viên không được vượt quá 255 ký tự.'),
  login: z
    .string()
    .max(50, 'Tài khoản đăng nhập không được vượt quá 50 ký tự.')
    .optional(),
  phone: z
    .string()
    .min(1, 'Số điện thoại là bắt buộc.')
    .max(20, 'Số điện thoại không được vượt quá 20 ký tự.'),
  address: z
    .string()
    .max(255, 'Địa chỉ không được vượt quá 255 ký tự.')
    .optional(),
  description: z
    .string()
    .max(1000, 'Mô tả không được vượt quá 1000 ký tự.')
    .optional(),
  role: z.enum(['OWNER', 'MANAGER', 'STAFF']),
  location_id: z.string().optional().nullable(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
})

type StaffForm = z.infer<typeof formSchema>

type StaffActionDialogProps = {
  currentRow?: StaffUser
  open: boolean
  onOpenChange: (open: boolean) => void
}

const normalizeOptionalText = (value?: string) =>
  value && value.trim().length > 0 ? value.trim() : null

export function StaffActionDialog({
  currentRow,
  open,
  onOpenChange,
}: StaffActionDialogProps) {
  const isEdit = !!currentRow
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const tenantCode = user?.tenant?.tenant_code ?? ''
  const queryClient = useQueryClient()
  const isOpenRef = useRef(open)

  const { data: locations = [] } = useQuery({
    ...getLocationsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const resolvedRole: StaffRole =
    currentRow?.role ?? 'STAFF'

  const form = useForm<StaffForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
        name: currentRow?.name ?? '',
        login: '',
        phone: currentRow?.phone ?? '',
        address: currentRow?.address ?? '',
        role: resolvedRole,
        location_id: currentRow?.location_id ?? null,
        password: '',
        confirmPassword: '',
      }
      : {
        name: '',
        login: '',
        phone: '',
        address: '',
        role: 'STAFF',
        location_id: null,
        password: '',
        confirmPassword: '',
      },
  })

  const roleValue = useWatch({ control: form.control, name: 'role' })

  const locationOptions = useMemo(
    () =>
      locations.map((location) => ({
        label: location.name,
        value: location.id,
      })),
    [locations]
  )

  const createMutation = useMutation({
    mutationFn: async (values: StaffForm) => {
      if (!tenantCode) {
        throw new Error('Thiếu tenant_code để tạo email đăng nhập.')
      }

      const email = `${(values.login ?? '').trim()}@${tenantCode}.nhathuoc.com`

      return userAccountsRepo.createUser({
        email,
        password: values.password ?? '',
        name: values.name,
        phone: values.phone.trim(),
        address: normalizeOptionalText(values.address) ?? undefined,
        role: values.role,
        login_id: (values.login ?? '').trim(),
        location_id:
          values.role === 'OWNER'
            ? undefined
            : values.location_id ?? undefined,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-users', tenantId] })
      if (!isOpenRef.current) return
      form.reset()
      onOpenChange(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: (values: StaffForm) =>
      profilesRepo.updateProfile(currentRow!.id, {
        name: values.name,
        phone: values.phone.trim(),
        address: normalizeOptionalText(values.address),
        location_id:
          resolvedRole === 'OWNER'
            ? null
            : values.location_id ?? null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-users', tenantId] })
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

  const onSubmit = (values: StaffForm) => {
    if (!isEdit) {
      if (!values.login || values.login.trim().length === 0) {
        form.setError('login', {
          message: 'Tài khoản đăng nhập là bắt buộc.',
        })
        return
      }
      if (!values.password || values.password.length < 6) {
        form.setError('password', {
          message: 'Mật khẩu tối thiểu 6 ký tự.',
        })
        return
      }

      if (values.password !== values.confirmPassword) {
        form.setError('confirmPassword', {
          message: 'Mật khẩu xác nhận không khớp.',
        })
        return
      }

      if (values.role !== 'OWNER' && !values.location_id) {
        form.setError('location_id', {
          message: 'Vui lòng chọn chi nhánh.',
        })
        return
      }

      if (!tenantCode) {
        toast.error('Thiếu tenant_code để tạo email đăng nhập.')
        return
      }

      createMutation.mutate(values)
      return
    }

    updateMutation.mutate(values)
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
        if (!state) {
          form.reset()
        }
        onOpenChange(state)
      }}
    >
      <DialogContent className={isEdit ? 'sm:max-w-lg' : 'sm:max-w-4xl'}>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Cập nhật thông tin nhân viên.'
              : 'Tạo tài khoản nhân viên mới.'}{' '}
            Nhấn lưu khi hoàn tất.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='user-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <div className={isEdit ? 'space-y-4' : 'grid md:grid-cols-[2fr_auto_3fr] gap-6'}>
              {!isEdit && (
                <div className='space-y-4'>
                  <h4 className='text-sm font-medium'>Thông tin đăng nhập</h4>
                  <FormField
                    control={form.control}
                    name='login'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>Tài khoản</FormLabel>
                        <FormControl>
                          <Input
                            placeholder='Tài khoản đăng nhập...'
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
                    name='password'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>Mật khẩu</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder='Mật khẩu đăng nhập'
                            className='col-span-4'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='confirmPassword'
                    render={({ field }) => (
                      <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                        <FormLabel className='col-span-2 text-end'>Xác nhận</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder='Nhập lại mật khẩu'
                            className='col-span-4'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className='col-span-4 col-start-3' />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              {!isEdit && <Separator orientation='vertical' className='hidden md:block' />}
              <div className='space-y-4'>
                {!isEdit && <h4 className='text-sm font-medium'>Thông tin cá nhân</h4>}
                {isEdit && currentRow?.login_id && (
                  <div className='grid grid-cols-6 items-center gap-x-4 gap-y-1'>
                    <span className='col-span-2 text-sm font-medium'>Tài khoản</span>
                    <Input
                      value={currentRow.login_id}
                      className='col-span-4'
                      disabled
                    />
                  </div>
                )}
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>Tên</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='Tên nhân viên...'
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
                  name='role'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-start space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>Vai trò</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className='col-span-4 grid gap-2'
                          disabled={isEdit}
                        >
                          {roles.map(({ label, value }) => (
                            <FormItem
                              key={value}
                              className='flex items-center space-y-0 gap-2'
                            >
                              <FormControl>
                                <RadioGroupItem value={value} />
                              </FormControl>
                              <FormLabel className='font-normal'>
                                {label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='location_id'
                  render={({ field }) => (
                    <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                      <FormLabel className='col-span-2 text-end'>Chi nhánh</FormLabel>
                      <SelectDropdown
                        value={field.value ?? ''}
                        onValueChange={field.onChange}
                        placeholder='Chọn chi nhánh'
                        className='col-span-4'
                        items={locationOptions}
                        disabled={roleValue === 'OWNER'}
                      />
                      <FormMessage className='col-span-4 col-start-3' />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            {errorMessage && (
              <Alert variant='destructive'>
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
          </form>
        </Form>
        <DialogFooter>
          <Button type='submit' form='user-form' disabled={isPending}>
            {isPending
              ? isEdit
                ? 'Đang lưu'
                : 'Đang tạo'
              : isEdit
                ? 'Lưu thay đổi'
                : 'Tạo nhân viên'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
