import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { useUser } from '@/client/provider'
import { getLocationsQueryOptions } from '@/client/queries'
import { LocationsDialogs } from './components/locations-dialogs'
import { LocationsPrimaryButtons } from './components/locations-primary-buttons'
import { LocationsProvider } from './components/locations-provider'
import { LocationsTable } from './components/locations-table'

export function Locations() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  const { data: locations = [], isLoading, isError } = useQuery({
    ...getLocationsQueryOptions(tenantId),
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
    <LocationsProvider>
      <Header fixed>
        <div className='flex w-full items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-2xl font-bold tracking-tight'>Cửa hàng</h2>
            <p className='text-sm text-muted-foreground'>
              Quản lý cửa hàng và chi nhánh tại đây.
            </p>
          </div>
          <LocationsPrimaryButtons />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <LocationsTable data={locations} isLoading={isLoading} />
      </Main>

      <LocationsDialogs />
    </LocationsProvider>
  )
}
