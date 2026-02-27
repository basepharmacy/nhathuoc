import { useQuery } from '@tanstack/react-query'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useUser } from '@/client/provider'
import { getPurchaseOrdersQueryOptions } from '@/client/queries'
import { PurchaseOrdersHistoryTable } from './components/purchase-orders-history-table'

export function PurchaseOrdersHistory() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  const { data: orders = [], isLoading } = useQuery({
    ...getPurchaseOrdersQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Lịch sử nhập hàng</h2>
          <p className='text-muted-foreground'>Quản lý lịch sử nhập hàng tại đây.</p>
        </div>
        {isLoading ? (
          <div className='flex items-center justify-center py-10 text-muted-foreground'>
            Đang tải...
          </div>
        ) : (
          <PurchaseOrdersHistoryTable data={orders} />
        )}
      </Main>
    </>
  )
}
