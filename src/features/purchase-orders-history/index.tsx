import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useUser } from '@/client/provider'
import { useLocationContext } from '@/context/location-provider'
import {
  getPurchaseOrdersHistoryQueryOptions,
  getLocationsQueryOptions,
  getSuppliersQueryOptions,
} from '@/client/queries'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'

import { type PurchaseOrderWithRelations } from '@/services/supabase'
import { getPurchaseOrdersHistoryColumns } from './components/purchase-orders-history-columns'
import { PurchaseOrdersHistoryTable } from './components/purchase-orders-history-table'
import { usePurchaseOrdersHistoryTable } from './hooks/use-purchase-orders-history-table'
import { useDeletePurchaseOrder } from './hooks/use-delete-purchase-order'

export function PurchaseOrdersHistory() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const { selectedLocationId } = useLocationContext()
  const navigate = useNavigate()

  // Data queries
  const { data: suppliers = [], isError: isSuppliersError } = useQuery({
    ...getSuppliersQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const { data: locations = [], isError: isLocationsError } = useQuery({
    ...getLocationsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  // Actions
  const { deleteState, handleDelete } = useDeletePurchaseOrder(tenantId)

  const handleEdit = useCallback(
    (order: PurchaseOrderWithRelations) => {
      navigate({
        to: '/purchase-orders',
        search: { orderId: order.id },
      })
    },
    [navigate]
  )

  const columns = useMemo(
    () => getPurchaseOrdersHistoryColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [handleEdit, handleDelete]
  )

  // Table state + filters
  const { table, filters, queryParams } = usePurchaseOrdersHistoryTable({
    tenantId,
    columns,
    suppliers,
    locations,
    selectedLocationId,
  })

  // History query (driven by table's queryParams)
  const { data: historyResult, isLoading, isError: isHistoryError } = useQuery({
    ...getPurchaseOrdersHistoryQueryOptions(queryParams),
    enabled: !!tenantId,
  })

  // Feed query results back into the table
  const orders = historyResult?.data ?? []
  const total = historyResult?.total ?? 0
  table.options.data = orders
  table.options.rowCount = total
  table.options.pageCount = Math.max(1, Math.ceil(total / queryParams.pageSize))

  // Error toast
  const hasShownError = useRef(false)

  useEffect(() => {
    if ((isSuppliersError || isLocationsError || isHistoryError) && !hasShownError.current) {
      toast.error('Có lỗi khi lấy dữ liệu từ server, vui lòng thử lại')
      hasShownError.current = true
    }
  }, [isSuppliersError, isLocationsError, isHistoryError])

  return (
    <>
      <Header fixed>
        <div className='flex w-full items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-2xl font-bold tracking-tight'>Lịch sử nhập hàng</h2>
            <p className='text-sm text-muted-foreground'>
              Quản lý lịch sử nhập hàng tại đây.
            </p>
          </div>
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <PurchaseOrdersHistoryTable
          table={table}
          isLoading={isLoading}
          searchKey='purchase_order_code'
          filters={filters}
          deleteState={deleteState}
        />
      </Main>
    </>
  )
}
