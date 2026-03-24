import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Wallet } from 'lucide-react'
import { useUser } from '@/client/provider'
import { useLocationContext } from '@/context/location-provider'
import {
  getAllSupplierPaymentsHistoryQueryOptions,
  getLocationsQueryOptions,
  getSuppliersQueryOptions,
} from '@/client/queries'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { PrintPreviewDialog } from '@/components/print-preview-dialog'
import { type SupplierPaymentWithSupplier } from '@/services/supabase/database/repo/supplierPaymentsRepo'
import { usePermissions } from '@/hooks/use-permissions'
import { PurchasePeriodSelector } from '@/components/purchase-period-selector'
import { SuppliersPaymentDialog } from '@/features/suppliers/components/suppliers-payment-dialog'
import { SupplierPaymentInvoice } from './components/supplier-payment-invoice'
import { getSupplierPaymentsHistoryColumns } from './components/supplier-payments-history-columns'
import { SupplierPaymentsHistoryTable } from './components/supplier-payments-history-table'
import { useSupplierPaymentsHistoryTable } from './hooks/use-supplier-payments-history-table'
import { useDeleteSupplierPayment } from './hooks/use-delete-supplier-payment'

export function SupplierPaymentsHistory() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const { selectedLocationId } = useLocationContext()
  const { canEdit } = usePermissions()
  const [selectedPeriodId, setSelectedPeriodId] = useState('')
  const purchasePeriodId = selectedPeriodId ? Number(selectedPeriodId) : undefined

  // Data queries
  const { data: suppliers = [], isError: isSuppliersError } = useQuery({
    ...getSuppliersQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const { data: locations = [] } = useQuery({
    ...getLocationsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === selectedLocationId),
    [locations, selectedLocationId]
  )

  // Actions
  const { deleteState, handleDelete } = useDeleteSupplierPayment(tenantId)

  const [paymentOpen, setPaymentOpen] = useState(false)

  const [printTarget, setPrintTarget] = useState<SupplierPaymentWithSupplier | null>(null)
  const [printOpen, setPrintOpen] = useState(false)

  const handlePrint = useCallback((payment: SupplierPaymentWithSupplier) => {
    setPrintTarget(payment)
    setPrintOpen(true)
  }, [])

  const allowEdit = canEdit('supplier_payments')
  const columns = useMemo(
    () => getSupplierPaymentsHistoryColumns({ onPrint: handlePrint, onDelete: allowEdit ? handleDelete : undefined }),
    [handlePrint, handleDelete, allowEdit]
  )

  // Table state + filters
  const { table, filters, queryParams, fromDate, setFromDate, toDate, setToDate } =
    useSupplierPaymentsHistoryTable({
      tenantId,
      columns,
      suppliers,
      purchasePeriodId,
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
            <h2 className='text-2xl font-bold tracking-tight'>Lịch sử thanh toán</h2>
            <p className='text-sm text-muted-foreground'>
              Quản lý lịch sử thanh toán nhà cung cấp tại đây.
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <PurchasePeriodSelector
              periodId={selectedPeriodId}
              onPeriodChange={setSelectedPeriodId}
            />
          </div>
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex items-center gap-2'>
          {canEdit('supplier_payments') && (
            <Button className='space-x-1' onClick={() => setPaymentOpen(true)}>
              <span>Thanh toán</span> <Wallet size={18} />
            </Button>
          )}
        </div>
        <SupplierPaymentsHistoryTable
          table={table}
          isLoading={isLoading}
          searchKey='reference_code'
          filters={filters}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          deleteState={canEdit('supplier_payments') ? (deleteState ? {
            ...deleteState,
            desc: (
              <>
                Bạn có chắc chắn muốn xóa phiếu thanh toán{' '}
                <span className='font-bold'>
                  {deleteState.target?.reference_code}
                </span>
                ?
              </>
            ),
          } : null) : null}
        />
      </Main>

      <SuppliersPaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        suppliers={suppliers}
      />

      {printTarget && (
        <PrintPreviewDialog
          open={printOpen}
          onOpenChange={(open) => {
            setPrintOpen(open)
            if (!open) setPrintTarget(null)
          }}
          title='In phiếu thanh toán NCC'
          documentTitle={`Phieu thanh toan - ${printTarget.reference_code}`}
        >
          <SupplierPaymentInvoice
            referenceCode={printTarget.reference_code ?? ''}
            tenantName={user?.tenant?.name}
            tenantAddress={user?.tenant?.address ?? undefined}
            tenantPhone={user?.tenant?.phone ?? undefined}
            storeName={selectedLocation?.name}
            storeAddress={selectedLocation?.address ?? undefined}
            storePhone={selectedLocation?.phone ?? undefined}
            supplierName={printTarget.supplier?.name}
            amount={printTarget.amount ?? 0}
            paymentDate={printTarget.payment_date}
            note={printTarget.note}
          />
        </PrintPreviewDialog>
      )}
    </>
  )
}
