import { useQuery } from '@tanstack/react-query'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useUser } from '@/client/provider'
import { getSuppliersQueryOptions } from '@/client/queries'
import { SuppliersDialogs } from './components/suppliers-dialogs'
import { SuppliersPrimaryButtons } from './components/suppliers-primary-buttons'
import { SuppliersProvider } from './components/suppliers-provider'
import { SuppliersTable } from './components/suppliers-table'

export function Suppliers() {
  console.log('Render Suppliers')
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  const { data: suppliers = [], isLoading } = useQuery({
    ...getSuppliersQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  return (
    <SuppliersProvider>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>Nhà cung cấp</h2>
            <p className='text-muted-foreground'>
              Quản lý nhà cung cấp tại đây.
            </p>
          </div>
          <SuppliersPrimaryButtons />
        </div>
        {isLoading ? (
          <div className='flex items-center justify-center py-10 text-muted-foreground'>
            Đang tải...
          </div>
        ) : (
          <SuppliersTable data={suppliers} />
        )}
      </Main>

      <SuppliersDialogs />
    </SuppliersProvider>
  )
}
