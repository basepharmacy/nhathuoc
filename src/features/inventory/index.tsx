import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useUser } from '@/client/provider'
import {
  getInventoryBatchesListQueryOptions,
  getInventoryProductsListQueryOptions,
  getInventoryBatchesSummaryQueryOptions,
  getLocationsQueryOptions,
} from '@/client/queries'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { InventoryProductTable } from './components/inventory-product-table'
import { InventoryBatchTable } from './components/inventory-batch-table'
import { InventorySummaryCards } from './components/inventory-summary-cards'
import { useInventoryTable } from './hooks/use-inventory-table'

type InventoryViewMode = 'product' | 'batch'

export function Inventory() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const [viewMode, setViewMode] = useState<InventoryViewMode>('product')

  // Data queries
  const { data: locations = [], isError: isLocationsError } = useQuery({
    ...getLocationsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  // Table state + filters
  const { tableState, filters, listQueryParams } = useInventoryTable({
    tenantId,
    locations,
  })

  // List query (driven by table's queryParams)
  const {
    data: batchListResult,
    isLoading: isBatchLoading,
    isError: isBatchError,
  } = useQuery({
    ...getInventoryBatchesListQueryOptions(listQueryParams),
    enabled: !!tenantId && viewMode === 'batch',
  })

  const {
    data: productListResult,
    isLoading: isProductLoading,
    isError: isProductError,
  } = useQuery({
    ...getInventoryProductsListQueryOptions(listQueryParams),
    enabled: !!tenantId && viewMode === 'product',
  })

  // Summary query
  const { data: summaryResult, isError: isSummaryError } = useQuery({
    ...getInventoryBatchesSummaryQueryOptions({ tenantId }),
    enabled: !!tenantId,
  })

  const batchRows = batchListResult?.data ?? []
  const batchTotal = batchListResult?.total ?? 0
  const batchPageCount = Math.max(1, Math.ceil(batchTotal / listQueryParams.pageSize))

  const productRows = productListResult?.data ?? []
  const productTotal = productListResult?.total ?? 0
  const productPageCount = Math.max(1, Math.ceil(productTotal / listQueryParams.pageSize))
  const summary = summaryResult ?? {
    totalProducts: 0,
    totalQuantity: 0,
    totalValue: 0,
  }

  // Error toast
  const hasShownError = useRef(false)

  useEffect(() => {
    if (
      (isLocationsError || isBatchError || isProductError || isSummaryError) &&
      !hasShownError.current
    ) {
      toast.error('Có lỗi khi lấy dữ liệu từ server, vui lòng thử lại')
      hasShownError.current = true
    }
  }, [isLocationsError, isBatchError, isProductError, isSummaryError])

  return (
    <>
      <Header fixed>
        <div className='flex w-full items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-2xl font-bold tracking-tight'>Tồn kho</h2>
            <p className='text-sm text-muted-foreground'>
              Quản lý danh sách tồn kho.
            </p>
          </div>
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <InventorySummaryCards summary={summary} />

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as InventoryViewMode)}>
          <div className='flex flex-wrap items-center gap-2'>
            <TabsList>
              <TabsTrigger value='product'>Theo sản phẩm</TabsTrigger>
              <TabsTrigger value='batch'>Theo lô</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='product'>
            <InventoryProductTable
              rows={productRows}
              tableState={tableState}
              pageCount={productPageCount}
              total={productTotal}
              isLoading={isProductLoading}
              filters={filters}
            />
          </TabsContent>
          <TabsContent value='batch'>
            <InventoryBatchTable
              batches={batchRows}
              tableState={tableState}
              pageCount={batchPageCount}
              total={batchTotal}
              isLoading={isBatchLoading}
              filters={filters}
            />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
