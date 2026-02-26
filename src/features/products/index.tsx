import { useQuery } from '@tanstack/react-query'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { useUser } from '@/client/provider'
import { getProductsQueryOptions } from '@/client/queries'
import { ProductsDialogs } from './components/products-dialogs'
import { ProductsPrimaryButtons } from './components/products-primary-buttons'
import { ProductsProvider } from './components/products-provider'
import { ProductsTable } from './components/products-table'

export function Products() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  const { data: products = [], isLoading } = useQuery({
    ...getProductsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  return (
    <ProductsProvider>
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
            <h2 className='text-2xl font-bold tracking-tight'>Sản phẩm</h2>
            <p className='text-muted-foreground'>
              Quản lý danh sách sản phẩm tại đây.
            </p>
          </div>
          <ProductsPrimaryButtons />
        </div>
        {isLoading ? (
          <div className='flex items-center justify-center py-10 text-muted-foreground'>
            Đang tải...
          </div>
        ) : (
          <ProductsTable data={products} />
        )}
      </Main>

      <ProductsDialogs />
    </ProductsProvider>
  )
}
