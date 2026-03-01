import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { DataTableSkeleton } from '@/components/data-table'
import { useUser } from '@/client/provider'
import { getCategoriesQueryOptions } from '@/client/queries'
import { CategoriesDialogs } from './components/categories-dialogs'
import { CategoriesPrimaryButtons } from './components/categories-primary-buttons'
import { CategoriesProvider } from './components/categories-provider'
import { CategoriesTable } from './components/categories-table'

export function Categories() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  const { data: categories = [], isLoading, isError } = useQuery({
    ...getCategoriesQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const hasShownError = useRef(false)

  useEffect(() => {
    if (isError && !hasShownError.current) {
      toast.error('Có lỗi khi lấy dữ liệu từ server, vui lòng thử lại')
      hasShownError.current = true
    }
  }, [isError])

  return (
    <CategoriesProvider>
      <Header fixed>
        <div className='flex w-full items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-2xl font-bold tracking-tight'>Danh mục</h2>
            <p className='text-sm text-muted-foreground'>
              Quản lý danh mục sản phẩm tại đây.
            </p>
          </div>
          <CategoriesPrimaryButtons />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        {isLoading ? (
          <DataTableSkeleton rows={10} columns={5} />
        ) : (
          <CategoriesTable data={categories} />
        )}
      </Main>

      <CategoriesDialogs />
    </CategoriesProvider>
  )
}
