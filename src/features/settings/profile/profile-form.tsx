import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/client/provider'
import { profilesRepo } from '@/client'
import { Button } from '@/components/ui/button'
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

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Chủ hệ thống',
  MANAGER: 'Quản lý',
  STAFF: 'Nhân viên',
}

const profileFormSchema = z.object({
  name: z
    .string('Vui lòng nhập tên.')
    .min(2, 'Tên phải có ít nhất 2 ký tự.'),
  phone: z.string().optional(),
  address: z.string().optional(),
  description: z.string().max(500, 'Mô tả tối đa 500 ký tự.').optional(),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

export function ProfileForm() {
  const { user } = useUser()
  const queryClient = useQueryClient()
  const profile = user?.profile

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile?.name ?? '',
      phone: profile?.phone ?? '',
      address: profile?.address ?? '',
      description: profile?.description ?? '',
    },
  })

  async function onSubmit(data: ProfileFormValues) {
    if (!profile) return

    try {
      await profilesRepo.updateProfile(profile.id, {
        name: data.name,
        phone: data.phone || null,
        address: data.address || null,
        description: data.description || null,
      })
      await queryClient.invalidateQueries({ queryKey: ['profiles'] })
      toast.success('Cập nhật thông tin thành công.')
    } catch {
      toast.error('Không thể cập nhật thông tin. Vui lòng thử lại.')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className='grid gap-6 sm:grid-cols-2'>
          <FormItem>
            <FormLabel>Tên đăng nhập</FormLabel>
            <FormControl>
              <Input value={profile?.login_id ?? ''} disabled />
            </FormControl>
          </FormItem>

          <FormItem>
            <FormLabel>Vai trò</FormLabel>
            <FormControl>
              <Input
                value={
                  profile?.role ? (ROLE_LABELS[profile.role] ?? profile.role) : ''
                }
                disabled
              />
            </FormControl>
          </FormItem>
        </div>

        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên</FormLabel>
              <FormControl>
                <Input placeholder='Nhập tên' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='phone'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số điện thoại</FormLabel>
              <FormControl>
                <Input placeholder='Nhập số điện thoại' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='address'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa chỉ</FormLabel>
              <FormControl>
                <Input placeholder='Nhập địa chỉ' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea
                  placeholder='Nhập mô tả về bản thân'
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Đang lưu...' : 'Cập nhật'}
        </Button>
      </form>
    </Form>
  )
}
