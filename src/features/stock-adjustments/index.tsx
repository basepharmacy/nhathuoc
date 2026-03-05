import { useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useUser } from '@/client/provider'
import { useLocationContext } from '@/context/location-provider'
import {
  getLocationsQueryOptions,
  getStockAdjustmentsListQueryOptions,
} from '@/client/queries'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { StockAdjustmentsProvider } from './components/stock-adjustments-provider'
import { StockAdjustmentsPrimaryButtons } from './components/stock-adjustments-primary-buttons'
import { StockAdjustmentsTable } from './components/stock-adjustments-table'
import { StockAdjustmentsDialogs } from './components/stock-adjustments-dialogs'
import { useStockAdjustmentsTable } from './hooks/use-stock-adjustments-table'

export function StockAdjustments() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const { selectedLocationId } = useLocationContext()

  const { data: locations = [], isError: isLocationsError } = useQuery({
    ...getLocationsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const { tableState, filters, listQueryParams } = useStockAdjustmentsTable({
    tenantId,
    locations,
    selectedLocationId,
  })

  const { data: listResult, isLoading, isError: isListError } = useQuery({
    ...getStockAdjustmentsListQueryOptions(listQueryParams),
    enabled: !!tenantId,
  })

  const adjustments = listResult?.data ?? []
  const total = listResult?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / listQueryParams.pageSize))

  const hasShownError = useRef(false)

  useEffect(() => {
    if ((isLocationsError || isListError) && !hasShownError.current) {
      toast.error('Có lỗi khi lấy dữ liệu từ server, vui lòng thử lại')
      hasShownError.current = true
    }
  }, [isLocationsError, isListError])

  return (
    <StockAdjustmentsProvider>
      <Header fixed>
        <div className='flex w-full items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-2xl font-bold tracking-tight'>Điều chỉnh tồn kho</h2>
            <p className='text-sm text-muted-foreground'>
              Quản lý các điều chỉnh tồn kho.
            </p>
          </div>
          <StockAdjustmentsPrimaryButtons />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <StockAdjustmentsTable
          data={adjustments}
          tableState={tableState}
          pageCount={pageCount}
          total={total}
          isLoading={isLoading}
          filters={filters}
        />
      </Main>

      <StockAdjustmentsDialogs />
    </StockAdjustmentsProvider>
  )
}
