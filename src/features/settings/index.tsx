import { Outlet } from '@tanstack/react-router'
import { Wrench, UserCog } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { SidebarNav } from './components/sidebar-nav'

const sidebarNavItems = [
  {
    title: 'Thông tin cá nhân',
    href: '/settings',
    icon: <UserCog size={18} />,
  },
  {
    title: 'Tài khoản hệ thống ',
    href: '/settings/account',
    icon: <Wrench size={18} />,
  }
]

export function Settings() {
  return (
    <>
      {/* ===== Top Heading ===== */}
      <Header fixed>
        <div className='flex w-full items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-2xl font-bold tracking-tight'>Thiết lập</h2>
            <p className='text-sm text-muted-foreground'>
              Quản lý thiết lập cá nhân của bạn ở đây.
            </p>
          </div>
        </div>
      </Header>

      <Main>
        <div className='flex flex-1 flex-col space-y-2 overflow-hidden md:space-y-2 lg:flex-row lg:space-y-0 lg:space-x-12'>
          <aside className='top-0 lg:sticky lg:w-1/5'>
            <SidebarNav items={sidebarNavItems} />
          </aside>
          <div className='flex w-full overflow-y-hidden p-1'>
            <Outlet />
          </div>
        </div>
      </Main>
    </>
  )
}
