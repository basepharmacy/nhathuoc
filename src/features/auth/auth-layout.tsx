import { Logo } from '@/assets/logo'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='container grid h-svh max-w-none items-center justify-center'>
      <div className='mx-auto flex w-full flex-col justify-center space-y-2 py-8 sm:w-[480px] sm:p-8'>
        <div className='mb-4 flex flex-col items-center justify-center gap-2'>
          <div className='flex items-center'>
            <Logo className='me-3 size-20' />
            <h1 className='text-3xl font-bold'>Sổ nhà thuốc</h1>
          </div>
          <p className='text-sm text-muted-foreground'>Siêu đơn giản - Sổ tay dùng ngay - Bán hàng 5 giây!</p>
        </div>
        {children}
      </div>
    </div>
  )
}
