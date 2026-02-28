import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useUser } from '@/client/provider'
import { purchaseOrdersRepo } from '@/client'
import {
  getPurchaseOrdersHistoryQueryOptions,
  getSuppliersQueryOptions,
} from '@/client/queries'
import { ConfigDrawer } from '@/components/config-drawer'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'
import { type PurchaseOrderWithRelations } from '@/services/supabase/database/repo/purchaseOrdersRepo'
import { getPurchaseOrdersHistoryColumns } from './components/purchase-orders-history-columns'
import { PurchaseOrdersHistoryTable } from './components/purchase-orders-history-table'

export function PurchaseOrdersHistory() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrderWithRelations | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteTarget || !tenantId) {
        throw new Error('Thiếu thông tin đơn nhập hàng.')
      }
      await purchaseOrdersRepo.deletePurchaseOrder({
        orderId: deleteTarget.id,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', tenantId] })
      queryClient.invalidateQueries({
        queryKey: ['purchase-orders', tenantId, 'history'],
      })
      setDeleteOpen(false)
      setDeleteTarget(null)
      toast.success('Đã xóa đơn nhập hàng.')
    },
    onError: (error) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Đã xảy ra lỗi, vui lòng thử lại.'
      toast.error(message)
    },
  })

  const handleEdit = useCallback(
    (order: PurchaseOrderWithRelations) => {
      navigate({
        to: '/purchase-orders',
        search: {
          orderId: order.id,
        },
      })
    },
    [navigate]
  )

  const handleDelete = useCallback((order: PurchaseOrderWithRelations) => {
    if (order.status !== '1_DRAFT') {
      toast.error('Chỉ có thể xóa đơn nháp.')
      return
    }
    setDeleteTarget(order)
    setDeleteOpen(true)
  }, [])

  const columns = useMemo(
    () => getPurchaseOrdersHistoryColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [handleEdit, handleDelete]
  )

  const { data: suppliers = [] } = useQuery({
    ...getSuppliersQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const supplierOptions = useMemo(
    () =>
      suppliers.map((supplier) => ({
        label: supplier.name,
        value: supplier.id,
      })),
    [suppliers]
  )

  const statusOptions = useMemo(
    () => [
      { label: 'Nháp', value: '1_DRAFT' },
      { label: 'Đã đặt', value: '2_ORDERED' },
      { label: 'Đang kiểm', value: '3_CHECKING' },
      { label: 'Đã nhập kho', value: '4_STORED' },
      { label: 'Đã hủy', value: '9_CANCELLED' },
    ],
    []
  )

  const paymentOptions = useMemo(
    () => [
      { label: 'Chưa thanh toán', value: '1_UNPAID' },
      { label: 'Thanh toán một phần', value: '2_PARTIALLY_PAID' },
      { label: 'Đã thanh toán', value: '3_PAID' },
    ],
    []
  )

  const searchValue = useMemo(() => {
    const searchFilter = columnFilters.find(
      (filter) => filter.id === 'purchase_order_code'
    )
    return typeof searchFilter?.value === 'string' ? searchFilter.value : ''
  }, [columnFilters])

  const supplierIds = useMemo(() => {
    const supplierFilter = columnFilters.find(
      (filter) => filter.id === 'supplier_name'
    )
    return Array.isArray(supplierFilter?.value)
      ? (supplierFilter?.value as string[])
      : []
  }, [columnFilters])

  const statusFilters = useMemo(() => {
    const statusFilter = columnFilters.find((filter) => filter.id === 'status')
    return Array.isArray(statusFilter?.value)
      ? (statusFilter?.value as PurchaseOrderWithRelations['status'][])
      : []
  }, [columnFilters])

  const paymentStatusFilters = useMemo(() => {
    const paymentStatusFilter = columnFilters.find(
      (filter) => filter.id === 'payment_status'
    )
    return Array.isArray(paymentStatusFilter?.value)
      ? (paymentStatusFilter?.value as PurchaseOrderWithRelations['payment_status'][])
      : []
  }, [columnFilters])

  const { data: historyResult, isLoading } = useQuery({
    ...getPurchaseOrdersHistoryQueryOptions({
      tenantId,
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      search: searchValue,
      supplierIds,
      statuses: statusFilters,
      paymentStatuses: paymentStatusFilters,
      sorting,
    }),
    enabled: !!tenantId,
  })

  const orders = historyResult?.data ?? []
  const total = historyResult?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / pagination.pageSize))

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }))
  }, [columnFilters, sorting])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: orders,
    columns,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualSorting: true,
    manualPagination: true,
    pageCount,
    rowCount: total,
  })

  const handleDeleteDialogOpenChange = useCallback(
    (open: boolean) => {
      setDeleteOpen(open)
      if (!open) {
        setDeleteTarget(null)
      }
    },
    []
  )

  const filters = useMemo(
    () => [
      {
        columnId: 'supplier_name',
        title: 'Nhà cung cấp',
        options: supplierOptions,
      },
      {
        columnId: 'status',
        title: 'Trạng thái',
        options: statusOptions,
      },
      {
        columnId: 'payment_status',
        title: 'Trạng thái thanh toán',
        options: paymentOptions,
      },
    ],
    [supplierOptions, statusOptions, paymentOptions]
  )
  const deleteState = useMemo(() => {
    if (!deleteTarget) return null
    return {
      target: deleteTarget,
      open: deleteOpen,
      onOpenChange: handleDeleteDialogOpenChange,
      disabled: deleteMutation.isPending,
      onConfirm: () => deleteMutation.mutate(),
    }
  }, [deleteTarget, deleteOpen, handleDeleteDialogOpenChange, deleteMutation])

  return (
    <>
      <Header fixed>
        <Search />
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ConfigDrawer />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Lịch sử nhập hàng</h2>
          <p className='text-muted-foreground'>Quản lý lịch sử nhập hàng tại đây.</p>
        </div>
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
