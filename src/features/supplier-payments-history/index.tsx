import { useEffect, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useUser } from '@/client/provider'
import {
  getAllSupplierPaymentsHistoryQueryOptions,
  getSuppliersQueryOptions,
} from '@/client/queries'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { getSupplierPaymentsHistoryColumns } from './components/supplier-payments-history-columns'
import { SupplierPaymentsHistoryTable } from './components/supplier-payments-history-table'
import { useSupplierPaymentsHistoryTable } from './hooks/use-supplier-payments-history-table'

export function SupplierPaymentsHistory() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  // Data queries
  const { data: suppliers = [], isError: isSuppliersError } = useQuery({
    ...getSuppliersQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const columns = useMemo(
    () => getSupplierPaymentsHistoryColumns(),
    []
  )

  // Table state + filters
  const { table, filters, queryParams, fromDate, setFromDate, toDate, setToDate } =
    useSupplierPaymentsHistoryTable({
      tenantId,
      columns,
      suppliers,
    })

  // History query (driven by table's queryParams)
  const { data: historyResult, isLoading, isError: isHistoryError } = useQuery({
    ...getAllSupplierPaymentsHistoryQueryOptions(queryParams),
    enabled: !!tenantId,
  })

  // Feed query results back into the table
  const payments = historyResult?.data ?? []
  const total = historyResult?.total ?? 0
  table.options.data = payments
  table.options.rowCount = total
  table.options.pageCount = Math.max(1, Math.ceil(total / queryParams.pageSize))

  // Error toast
  const hasShownError = useRef(false)

  useEffect(() => {
    if ((isSuppliersError || isHistoryError) && !hasShownError.current) {
      toast.error('Có lỗi khi lấy dữ liệu từ server, vui lòng thử lại')
      hasShownError.current = true
    }
  }, [isSuppliersError, isHistoryError])

  return (
    <>
      <Header fixed>
        <div className='flex w-full items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-2xl font-bold tracking-tight'>Lịch sử thanh toán NCC</h2>
            <p className='text-sm text-muted-foreground'>
              Quản lý lịch sử thanh toán nhà cung cấp tại đây.
            </p>
          </div>
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <SupplierPaymentsHistoryTable
          table={table}
          isLoading={isLoading}
          searchKey='reference_code'
          filters={filters}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
        />
      </Main>
    </>
  )
}
