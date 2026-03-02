import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { useUser } from '@/client/provider'
import { getCustomersQueryOptions } from '@/client/queries'
import { CustomersDialogs } from './components/customers-dialogs'
import { CustomersPrimaryButtons } from './components/customers-primary-buttons'
import { CustomersProvider } from './components/customers-provider'
import { CustomersTable } from './components/customers-table'

export function Customers() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  const { data: customers = [], isLoading, isPending, isError } = useQuery({
    ...getCustomersQueryOptions(tenantId),
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
    <CustomersProvider>
      <Header fixed>
        <div className='flex w-full items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-2xl font-bold tracking-tight'>Khách hàng</h2>
            <p className='text-sm text-muted-foreground'>
              Quản lý danh sách khách hàng tại đây.
            </p>
          </div>
          <CustomersPrimaryButtons />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <CustomersTable data={customers} isLoading={isLoading || isPending} />
      </Main>

      <CustomersDialogs />
    </CustomersProvider>
  )
}
