import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { DataTableSkeleton } from '@/components/data-table'
import { useUser } from '@/client/provider'
import { getCategoriesQueryOptions, getProductsQueryOptions } from '@/client/queries'
import { ProductsDialogs } from './components/products-dialogs'
import { ProductsPrimaryButtons } from './components/products-primary-buttons'
import { ProductsProvider } from './components/products-provider'
import { ProductsTable } from './components/products-table'

export function Products() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  const { data: products = [], isLoading, isError: isProductsError } = useQuery({
    ...getProductsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const { data: categories = [], isError: isCategoriesError } = useQuery({
    ...getCategoriesQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const hasShownError = useRef(false)

  useEffect(() => {
    if ((isProductsError || isCategoriesError) && !hasShownError.current) {
      toast.error('Có lỗi khi lấy dữ liệu từ server, vui lòng thử lại')
      hasShownError.current = true
    }
  }, [isProductsError, isCategoriesError])

  return (
    <ProductsProvider>
      <Header fixed>
        <div className='flex w-full items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-2xl font-bold tracking-tight'>Sản phẩm</h2>
            <p className='text-sm text-muted-foreground'>
              Quản lý sản phẩm tại đây.
            </p>
          </div>
          <ProductsPrimaryButtons />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {isLoading ? (
          <DataTableSkeleton rows={10} columns={8} />
        ) : (
          <ProductsTable data={products} categories={categories} />
        )}
      </Main>

      <ProductsDialogs categories={categories} />
    </ProductsProvider>
  )
}
