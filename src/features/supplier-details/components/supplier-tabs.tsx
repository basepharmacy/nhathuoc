import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/client/provider'
import { useLocationContext } from '@/context/location-provider'
import { useSuppliers } from '@/features/suppliers/components/suppliers-provider'
import { type Supplier } from '@/features/suppliers/data/schema'
import { type PurchaseOrderWithRelations, type SupplierPaymentWithSupplier } from '@/services/supabase/database/model'
import {
  getLocationsQueryOptions,
  getPurchaseOrdersHistoryQueryOptions,
  getSupplierPaymentsHistoryQueryOptions,
} from '@/client/queries'
import { usePermissions } from '@/hooks/use-permissions'
import { PrintPreviewDialog } from '@/components/print-preview-dialog'
import { PurchaseOrdersHistoryTable } from '@/features/purchase-orders-history/components/purchase-orders-history-table'
import { getPurchaseOrdersHistoryColumns } from '@/features/purchase-orders-history/components/purchase-orders-history-columns'
import { useDeletePurchaseOrder } from '@/features/purchase-orders-history/hooks/use-delete-purchase-order'
import { SupplierPaymentsHistoryTable } from '@/features/supplier-payments-history/components/supplier-payments-history-table'
import { getSupplierPaymentsHistoryColumns } from '@/features/supplier-payments-history/components/supplier-payments-history-columns'
import { useDeleteSupplierPayment } from '@/features/supplier-payments-history/hooks/use-delete-supplier-payment'
import { SupplierPaymentInvoice } from '@/features/supplier-payments-history/components/supplier-payment-invoice'

type SupplierTabsProps = {
  tenantId: string
  supplierId: string
  supplier?: Supplier | null
  purchasePeriodId?: number
}

export function SupplierTabs({ tenantId, supplierId, supplier, purchasePeriodId }: SupplierTabsProps) {
  const { setCurrentRow, setOpen } = useSuppliers()
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()
  const navigate = useNavigate()
  const { canView, canEdit } = usePermissions()

  const { data: locations = [] } = useQuery({
    ...getLocationsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === selectedLocationId),
    [locations, selectedLocationId]
  )

  // Payment delete
  const { deleteState, handleDelete } = useDeleteSupplierPayment<SupplierPaymentWithSupplier>(tenantId, {
    additionalQueryKeys: [['suppliers']],
  })

  // Payment print
  const [printTarget, setPrintTarget] = useState<SupplierPaymentWithSupplier | null>(null)
  const [printOpen, setPrintOpen] = useState(false)

  const handlePrint = useCallback((payment: SupplierPaymentWithSupplier) => {
    setPrintTarget(payment)
    setPrintOpen(true)
  }, [])

  // Payment table state
  const [paymentFilters, setPaymentFilters] = useState<ColumnFiltersState>([])
  const [paymentSorting, setPaymentSorting] = useState<SortingState>([
    { id: 'created_at', desc: true },
  ])
  const [paymentPagination, setPaymentPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [paymentFromDate, setPaymentFromDate] = useState<Date | undefined>(undefined)
  const [paymentToDate, setPaymentToDate] = useState<Date | undefined>(undefined)

  const paymentSearchValue = useMemo(() => {
    const searchFilter = paymentFilters.find((filter) => filter.id === 'reference_code')
    return typeof searchFilter?.value === 'string' ? searchFilter.value : ''
  }, [paymentFilters])

  const formatDateParam = (date: Date | undefined) => {
    if (!date) return undefined
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const { data: paymentsResult, isLoading: isPaymentsLoading } = useQuery({
    ...getSupplierPaymentsHistoryQueryOptions({
      tenantId,
      supplierId,
      pageIndex: paymentPagination.pageIndex,
      pageSize: paymentPagination.pageSize,
      search: paymentSearchValue,
      fromDate: formatDateParam(paymentFromDate),
      toDate: formatDateParam(paymentToDate),
      purchasePeriodId,
      sorting: paymentSorting,
    }),
    enabled: !!tenantId && !!supplierId,
  })

  const payments = paymentsResult?.data ?? []
  const paymentsTotal = paymentsResult?.total ?? 0
  const paymentsPageCount = Math.max(1, Math.ceil(paymentsTotal / paymentPagination.pageSize))

  useEffect(() => {
    setPaymentPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }))
  }, [paymentFilters, paymentSorting])

  const allowEditPayments = canEdit('supplier_payments')
  const supplierPaymentsColumns = useMemo(
    () => getSupplierPaymentsHistoryColumns({ onPrint: handlePrint, onDelete: allowEditPayments ? handleDelete : undefined, hideSupplier: true }),
    [handlePrint, handleDelete, allowEditPayments]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const paymentsTable = useReactTable<SupplierPaymentWithSupplier>({
    data: payments as SupplierPaymentWithSupplier[],
    columns: supplierPaymentsColumns,
    state: {
      pagination: paymentPagination,
      columnFilters: paymentFilters,
      sorting: paymentSorting,
    },
    onPaginationChange: setPaymentPagination,
    onColumnFiltersChange: setPaymentFilters,
    onSortingChange: setPaymentSorting,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    pageCount: paymentsPageCount,
    rowCount: paymentsTotal,
  })

  // Orders actions
  const { deleteState: orderDeleteState, handleDelete: handleDeleteOrder } = useDeletePurchaseOrder(tenantId)

  const handleEditOrder = useCallback(
    (order: PurchaseOrderWithRelations) => {
      const isDraft = order.status === '1_DRAFT'
      navigate({
        to: isDraft ? '/purchase-orders' : '/purchase-orders/detail',
        search: { orderCode: order.purchase_order_code ?? '' },
      })
    },
    [navigate]
  )

  const orderColumns = useMemo(
    () => getPurchaseOrdersHistoryColumns({ onEdit: handleEditOrder, onDelete: handleDeleteOrder }),
    [handleEditOrder, handleDeleteOrder]
  )

  // Orders table state
  const [orderFilters, setOrderFilters] = useState<ColumnFiltersState>([])
  const [orderSorting, setOrderSorting] = useState<SortingState>([])
  const [orderPagination, setOrderPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [orderFromDate, setOrderFromDate] = useState<Date | undefined>(undefined)
  const [orderToDate, setOrderToDate] = useState<Date | undefined>(undefined)

  const orderSearchValue = useMemo(() => {
    const searchFilter = orderFilters.find(
      (filter) => filter.id === 'purchase_order_code'
    )
    return typeof searchFilter?.value === 'string' ? searchFilter.value : ''
  }, [orderFilters])

  const statusFilters = useMemo(() => {
    const statusFilter = orderFilters.find((filter) => filter.id === 'status')
    return Array.isArray(statusFilter?.value)
      ? (statusFilter?.value as PurchaseOrderWithRelations['status'][])
      : []
  }, [orderFilters])

  const paymentStatusFilters = useMemo(() => {
    const paymentStatusFilter = orderFilters.find(
      (filter) => filter.id === 'payment_status'
    )
    return Array.isArray(paymentStatusFilter?.value)
      ? (paymentStatusFilter?.value as PurchaseOrderWithRelations['payment_status'][])
      : []
  }, [orderFilters])

  const { data: ordersResult, isLoading: isOrdersLoading } = useQuery({
    ...getPurchaseOrdersHistoryQueryOptions({
      tenantId,
      pageIndex: orderPagination.pageIndex,
      pageSize: orderPagination.pageSize,
      search: orderSearchValue,
      supplierId,
      statuses: statusFilters,
      paymentStatuses: paymentStatusFilters,
      fromDate: formatDateParam(orderFromDate),
      toDate: formatDateParam(orderToDate),
      purchasePeriodId,
      sorting: orderSorting,
    }),
    enabled: !!tenantId && !!supplierId,
  })

  const orders = ordersResult?.data ?? []
  const ordersTotal = ordersResult?.total ?? 0
  const ordersPageCount = Math.max(1, Math.ceil(ordersTotal / orderPagination.pageSize))

  useEffect(() => {
    setOrderPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }))
  }, [orderFilters, orderSorting, orderFromDate, orderToDate])

  // eslint-disable-next-line react-hooks/incompatible-library
  const ordersTable = useReactTable<PurchaseOrderWithRelations>({
    data: orders,
    columns: orderColumns,
    state: {
      pagination: orderPagination,
      columnFilters: orderFilters,
      sorting: orderSorting,
      columnVisibility: { supplier_name: false },
    },
    onPaginationChange: setOrderPagination,
    onColumnFiltersChange: setOrderFilters,
    onSortingChange: setOrderSorting,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    pageCount: ordersPageCount,
    rowCount: ordersTotal,
  })

  const orderFiltersConfig = useMemo(
    () => [
      {
        columnId: 'status',
        title: 'Trạng thái',
        options: [
          { label: 'Nháp', value: '1_DRAFT' },
          { label: 'Đã đặt', value: '2_ORDERED' },
          { label: 'Đang kiểm', value: '3_CHECKING' },
          { label: 'Đã nhập kho', value: '4_STORED' },
          { label: 'Đã hủy', value: '9_CANCELLED' },
        ],
      },
      {
        columnId: 'payment_status',
        title: 'Thanh toán',
        options: [
          { label: 'Chưa thanh toán', value: '1_UNPAID' },
          { label: 'Thanh toán một phần', value: '2_PARTIALLY_PAID' },
          { label: 'Đã thanh toán', value: '3_PAID' },
        ],
      },
    ],
    []
  )

  return (
    <>
      <Tabs defaultValue={canView('supplier_payments') ? 'payments' : 'orders'} className='gap-4'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <TabsList>
            {canView('supplier_payments') && (
              <TabsTrigger value='payments'>Thanh toán</TabsTrigger>
            )}
            <TabsTrigger value='orders'>Lịch sử đặt hàng</TabsTrigger>
          </TabsList>
          {canEdit('supplier_payments') && (
            <Button
              size='sm'
              disabled={!supplier}
              onClick={() => {
                if (!supplier) return
                setCurrentRow(supplier)
                setOpen('payment')
              }}
            >
              Thanh toán
            </Button>
          )}
        </div>

        {canView('supplier_payments') && (
          <TabsContent value='payments'>
            <Card className='py-4'>
              <CardContent className='px-4'>
                <SupplierPaymentsHistoryTable
                  table={paymentsTable}
                  isLoading={isPaymentsLoading}
                  searchKey='reference_code'
                  searchPlaceholder='Tìm mã đơn, ghi chú...'
                  fromDate={paymentFromDate}
                  toDate={paymentToDate}
                  onFromDateChange={setPaymentFromDate}
                  onToDateChange={setPaymentToDate}
                  deleteState={canEdit('supplier_payments') ? (deleteState ? {
                    ...deleteState,
                    title: 'Xóa thanh toán',
                    desc: (
                      <>
                        Bạn có chắc chắn muốn xóa thanh toán
                        {deleteState.target?.reference_code ? (
                          <> mã <span className='font-bold'>{deleteState.target.reference_code}</span></>
                        ) : null}
                        ?
                        <br />
                        Số tiền sẽ tự động được hoàn lại vào công nợ của nhà cung cấp.
                        <br />
                        Các đơn hàng liên quan sẽ được cập nhật lại trạng thái thanh toán.
                      </>
                    ),
                  } : null) : null}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value='orders'>
          <Card className='py-4'>
            <CardContent className='px-4'>
              <PurchaseOrdersHistoryTable
                table={ordersTable}
                isLoading={isOrdersLoading}
                searchKey='purchase_order_code'
                filters={orderFiltersConfig}
                fromDate={orderFromDate}
                toDate={orderToDate}
                onFromDateChange={setOrderFromDate}
                onToDateChange={setOrderToDate}
                onRowClick={handleEditOrder}
                deleteState={orderDeleteState}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {printTarget && (
        <PrintPreviewDialog
          open={printOpen}
          onOpenChange={(open) => {
            setPrintOpen(open)
            if (!open) setPrintTarget(null)
          }}
          title='In phiếu thanh toán NCC'
          documentTitle={`Phieu thanh toan - ${printTarget!.reference_code}`}
        >
          <SupplierPaymentInvoice
            referenceCode={printTarget!.reference_code ?? ''}
            tenantName={user?.tenant?.name}
            tenantAddress={user?.tenant?.address ?? undefined}
            tenantPhone={user?.tenant?.phone ?? undefined}
            storeName={selectedLocation?.name}
            storeAddress={selectedLocation?.address ?? undefined}
            storePhone={selectedLocation?.phone ?? undefined}
            supplierName={supplier?.name}
            amount={printTarget!.amount ?? 0}
            paymentDate={printTarget!.payment_date}
            note={printTarget!.note}
          />
        </PrintPreviewDialog>
      )}
    </>
  )
}
