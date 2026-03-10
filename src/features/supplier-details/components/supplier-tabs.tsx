import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useSuppliers } from '@/features/suppliers/components/suppliers-provider'
import { type Supplier } from '@/features/suppliers/data/schema'
import { type PurchaseOrderWithRelations } from '@/services/supabase/database/repo/purchaseOrdersRepo'
import { type SupplierPayment } from '@/services/supabase/database/repo/supplierPaymentsRepo'
import { supplierPaymentsRepo } from '@/client'
import {
  getPurchaseOrdersHistoryQueryOptions,
  getSupplierPaymentsHistoryQueryOptions,
} from '@/client/queries'
import { PurchaseOrdersHistoryTable } from '@/features/purchase-orders-history/components/purchase-orders-history-table'
import { getSupplierPaymentsColumns } from './supplier-payments-columns'
import { SupplierPaymentsTable } from './supplier-payments-table'
import { supplierOrdersHistoryColumns } from './supplier-orders-history-columns'

type SupplierTabsProps = {
  tenantId: string
  supplierId: string
  supplier?: Supplier | null
}

export function SupplierTabs({ tenantId, supplierId, supplier }: SupplierTabsProps) {
  const { setCurrentRow, setOpen } = useSuppliers()
  const queryClient = useQueryClient()
  const [paymentFilters, setPaymentFilters] = useState<ColumnFiltersState>([])
  const [paymentSorting, setPaymentSorting] = useState<SortingState>([
    { id: 'created_at', desc: true },
  ])
  const [paymentPagination, setPaymentPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [deleteTarget, setDeleteTarget] = useState<SupplierPayment | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteTarget) throw new Error('Thiếu thông tin thanh toán.')
      await supplierPaymentsRepo.deleteSupplierPayment(deleteTarget.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-payments'] })
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      setDeleteOpen(false)
      setDeleteTarget(null)
      toast.success('Đã xóa thanh toán.')
    },
    onError: (error) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Đã xảy ra lỗi, vui lòng thử lại.'
      toast.error(message)
    },
  })

  const handleDeletePayment = useCallback((payment: SupplierPayment) => {
    setDeleteTarget(payment)
    setDeleteOpen(true)
  }, [])

  const [orderFilters, setOrderFilters] = useState<ColumnFiltersState>([])
  const [orderSorting, setOrderSorting] = useState<SortingState>([])
  const [orderPagination, setOrderPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })

  const paymentSearchValue = useMemo(() => {
    const searchFilter = paymentFilters.find((filter) => filter.id === 'note')
    return typeof searchFilter?.value === 'string' ? searchFilter.value : ''
  }, [paymentFilters])

  const { data: paymentsResult, isLoading: isPaymentsLoading } = useQuery({
    ...getSupplierPaymentsHistoryQueryOptions({
      tenantId,
      supplierId,
      pageIndex: paymentPagination.pageIndex,
      pageSize: paymentPagination.pageSize,
      search: paymentSearchValue,
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

  const supplierPaymentsColumns = useMemo(
    () => getSupplierPaymentsColumns({ onDelete: handleDeletePayment }),
    [handleDeletePayment]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const paymentsTable = useReactTable<SupplierPayment>({
    data: payments,
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
      supplierIds: supplierId ? [supplierId] : [],
      statuses: statusFilters,
      paymentStatuses: paymentStatusFilters,
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
  }, [orderFilters, orderSorting])

  // eslint-disable-next-line react-hooks/incompatible-library
  const ordersTable = useReactTable<PurchaseOrderWithRelations>({
    data: orders,
    columns: supplierOrdersHistoryColumns,
    state: {
      pagination: orderPagination,
      columnFilters: orderFilters,
      sorting: orderSorting,
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
    <Tabs defaultValue='payments' className='gap-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <TabsList>
          <TabsTrigger value='payments'>Thanh toán</TabsTrigger>
          <TabsTrigger value='orders'>Lịch sử đặt hàng</TabsTrigger>
        </TabsList>
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
      </div>

      <TabsContent value='payments'>
        <Card className='py-4'>
          <CardContent className='px-4'>
            <SupplierPaymentsTable table={paymentsTable} isLoading={isPaymentsLoading} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='orders'>
        <Card className='py-4'>
          <CardContent className='px-4'>
            <PurchaseOrdersHistoryTable
              table={ordersTable}
              isLoading={isOrdersLoading}
              searchKey='purchase_order_code'
              filters={orderFiltersConfig}
            />
          </CardContent>
        </Card>
      </TabsContent>

      {deleteTarget && (
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={(open) => {
            setDeleteOpen(open)
            if (!open) setDeleteTarget(null)
          }}
          destructive
          disabled={deleteMutation.isPending}
          title='Xóa thanh toán'
          desc={
            <>
              Bạn có chắc chắn muốn xóa thanh toán
              {deleteTarget.reference_code ? (
                <> mã <span className='font-bold'>{deleteTarget.reference_code}</span></>
              ) : null}
              ?
              <br />
              Số tiền sẽ tự động được hoàn lại vào công nợ của nhà cung cấp.
              <br />
              Các đơn hàng liên quan sẽ được cập nhật lại trạng thái thanh toán.
            </>
          }
          confirmText='Xóa'
          handleConfirm={() => deleteMutation.mutate()}
        />
      )}
    </Tabs>
  )
}
