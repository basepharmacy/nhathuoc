import { useEffect, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from '@tanstack/react-router'
import { Loader2, LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { supabaseAuth } from '@/services/supabase'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'

const mapAuthErrorToVietnamese = (error: unknown): string => {
  const fallback = 'Đăng nhập thất bại. Vui lòng thử lại.'

  if (!error || typeof error !== 'object') return fallback

  const status = 'status' in error ? Number(error.status) : undefined

  if (status === 429) {
    return 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.'
  }

  if (status === 401 || status === 400) {
    return 'Email hoặc mật khẩu không đúng.'
  }

  if (status && status >= 500) {
    return 'Máy chủ đang bận. Vui lòng thử lại sau.'
  }

  return fallback
}

const formSchema = z.object({
  login: z
    .string()
    .min(1, 'Hãy nhập tài khoản đăng nhập'),
  tenantCode: z
    .string()
    .min(1, 'Hãy nhập tenant code'),
  password: z
    .string()
    .min(1, 'Hãy nhập mật khẩu của bạn')
})

interface UserAuthFormProps extends React.HTMLAttributes<HTMLFormElement> {
  redirectTo?: string
}

const REMEMBER_TENANT_CODE_KEY = 'auth.remember.tenant_code'

export function UserAuthForm({
  className,
  redirectTo,
  ...props
}: UserAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [rememberTenantCode, setRememberTenantCode] = useState(false)
  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      login: '',
      tenantCode: '',
      password: '',
    },
  })

  useEffect(() => {
    const savedTenantCode = window.localStorage.getItem(REMEMBER_TENANT_CODE_KEY)

    if (!savedTenantCode) return

    form.setValue('tenantCode', savedTenantCode)
    setRememberTenantCode(true)
  }, [form])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const tenantCode = data.tenantCode.trim()

      if (rememberTenantCode) {
        window.localStorage.setItem(REMEMBER_TENANT_CODE_KEY, tenantCode)
      } else {
        window.localStorage.removeItem(REMEMBER_TENANT_CODE_KEY)
      }

      const email = `${data.login.trim()}@${tenantCode}.nhathuoc.com`

      await supabaseAuth.signInWithPassword({
        email,
        password: data.password,
      })

      const targetPath = redirectTo || '/'
      navigate({ to: targetPath, replace: true })

      toast.success(`Chào mừng bạn đăng nhập trở lại, ${email}!`)
    } catch (error) {
      toast.error(mapAuthErrorToVietnamese(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('grid gap-3', className)}
        {...props}
      >
        <FormField
          control={form.control}
          name='tenantCode'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã khách hàng</FormLabel>
              <FormControl>
                <Input placeholder='Mã khách hàng' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className='flex items-center gap-2'>
          <Checkbox
            id='remember-tenant-code'
            checked={rememberTenantCode}
            onCheckedChange={(checked) => setRememberTenantCode(checked === true)}
          />
          <label
            htmlFor='remember-tenant-code'
            className='text-sm text-muted-foreground'
          >
            Lưu mã khách hàng cho lần sau
          </label>
        </div>
        <FormField
          control={form.control}
          name='login'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tài khoản đăng nhập</FormLabel>
              <FormControl>
                <Input placeholder='Tài khoản đăng nhập' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <FormItem className='relative'>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <PasswordInput placeholder='********' {...field} />
              </FormControl>
              <FormMessage />
              <Link
                to='/forgot-password'
                className='absolute end-0 -top-0.5 text-sm font-medium text-muted-foreground hover:opacity-75'
              >
                Quên mật khẩu?
              </Link>
            </FormItem>
          )}
        />
        <Button className='mt-2' disabled={isLoading}>
          {isLoading ? <Loader2 className='animate-spin' /> : <LogIn />}
          Đăng nhập
        </Button>
      </form>
    </Form>
  )
}
