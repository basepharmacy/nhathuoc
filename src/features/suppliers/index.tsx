import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { useUser } from '@/client/provider'
import { getSuppliersQueryOptions } from '@/client/queries'
import { SuppliersDialogs } from './components/suppliers-dialogs'
import { SuppliersPrimaryButtons } from './components/suppliers-primary-buttons'
import { SuppliersProvider } from './components/suppliers-provider'
import { SuppliersTable } from './components/suppliers-table'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

function SuppliersContent() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  const { data: suppliers = [], isLoading, isError } = useQuery({
    ...getSuppliersQueryOptions(tenantId),
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
    <>
      <Header fixed>
        <div className='flex w-full items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-2xl font-bold tracking-tight'>Danh mục</h2>
            <p className='text-sm text-muted-foreground'>
              Quản lý danh mục sản phẩm tại đây.
            </p>
          </div>
          <SuppliersPrimaryButtons />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <SuppliersTable data={suppliers} isLoading={isLoading} />
      </Main>

      <SuppliersDialogs />
    </>
  )
}

export function Suppliers() {
  return (
    <SuppliersProvider>
      <SuppliersContent />
    </SuppliersProvider>
  )
}
