import { useQuery } from '@tanstack/react-query'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useUser } from '@/client/provider'
import { getCustomersQueryOptions } from '@/client/queries'
import { CustomersDialogs } from './components/customers-dialogs'
import { CustomersPrimaryButtons } from './components/customers-primary-buttons'
import { CustomersProvider } from './components/customers-provider'
import { CustomersTable } from './components/customers-table'

export function Customers() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  const { data: customers = [], isLoading } = useQuery({
    ...getCustomersQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  return (
    <CustomersProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Khách hàng</h2>
            <p className='text-muted-foreground'>Quản lý khách hàng tại đây.</p>
          </div>
          <CustomersPrimaryButtons />
        </div>
        <CustomersTable data={customers} isLoading={isLoading} />
      </Main>

      <CustomersDialogs />
    </CustomersProvider>
  )
}
