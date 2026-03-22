'use client'

import { useEffect, useRef } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useUser } from '@/client/provider'
import { supabaseAuth } from '@/services/supabase'
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
import { PasswordInput } from '@/components/ui/password-input'

const formSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, 'Mật khẩu cũ là bắt buộc.')
      .min(6, 'Mật khẩu cũ phải có ít nhất 6 ký tự.'),
    newPassword: z
      .string()
      .min(1, 'Mật khẩu mới là bắt buộc.')
      .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự.'),
    confirmPassword: z
      .string()
      .min(1, 'Vui lòng nhập lại mật khẩu mới.')
      .min(6, 'Mật khẩu xác nhận phải có ít nhất 6 ký tự.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu mới không khớp.',
    path: ['confirmPassword'],
  })

export type ChangePasswordForm = z.infer<typeof formSchema>

type ChangePasswordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const { user } = useUser()
  const email = user?.email ?? ''

  const form = useForm<ChangePasswordForm>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const isOpenRef = useRef(open)

  const changeMutation = useMutation({
    mutationFn: async (values: ChangePasswordForm) => {
      if (!email) {
        throw new Error('Không tìm thấy email người dùng để đổi mật khẩu.')
      }
      await supabaseAuth.changePassword({
        email,
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
    },
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công.')
      if (!isOpenRef.current) return
      form.reset()
      onOpenChange(false)
    },
  })

  useEffect(() => {
    isOpenRef.current = open
    if (open) {
      changeMutation.reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const onSubmit = (values: ChangePasswordForm) => {
    changeMutation.mutate(values)
  }

  const mutationError = changeMutation.error
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
          <DialogTitle>Đổi mật khẩu</DialogTitle>
          <DialogDescription>
            Nhập mật khẩu hiện tại và mật khẩu mới để cập nhật.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            id='change-password-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-4'
          >
            <FormField
              control={form.control}
              name='currentPassword'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Mật khẩu cũ</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder='Mật khẩu hiện tại...'
                      className='col-span-4'
                      autoComplete='current-password'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className='col-span-4 col-start-3' />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='newPassword'
              render={({ field }) => (
                <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                  <FormLabel className='col-span-2 text-end'>Mật khẩu mới</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder='Mật khẩu mới...'
                      className='col-span-4'
                      autoComplete='new-password'
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
                  <FormLabel className='col-span-2 text-end'>Nhập lại mật khẩu</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder='Nhập lại mật khẩu mới...'
                      className='col-span-4'
                      autoComplete='new-password'
                      {...field}
                    />
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
        <DialogFooter className='gap-2'>
          <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            type='submit'
            form='change-password-form'
            disabled={changeMutation.isPending}
          >
            Đổi mật khẩu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
