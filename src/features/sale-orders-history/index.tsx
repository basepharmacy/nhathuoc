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
import { saleOrdersRepo } from '@/client'
import {
  getCustomersQueryOptions,
  getLocationsQueryOptions,
  getSaleOrdersHistoryQueryOptions,
} from '@/client/queries'
import { formatFromDateParam, formatToDateParam } from '@/lib/utils'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { useLocationContext } from '@/context/location-provider'
import { useOfflineMutations } from '@/hooks/use-offline-mutations'
import { type SaleOrderWithRelations } from '@/services/supabase'
import { getSaleOrdersHistoryColumns } from './components/sale-orders-history-columns.tsx'
import { SaleOrdersHistoryTable } from './components/sale-orders-history-table.tsx'
import { OfflineOrdersBanner } from './components/offline-orders-banner.tsx'

export function SaleOrdersHistory() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const { selectedLocationId } = useLocationContext()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { mutations: offlineMutations } = useOfflineMutations()

  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() =>
    selectedLocationId
      ? [
        {
          id: 'location_name',
          value: [selectedLocationId],
        },
      ]
      : []
  )
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined)
  const [toDate, setToDate] = useState<Date | undefined>(undefined)
  const [deleteTarget, setDeleteTarget] = useState<SaleOrderWithRelations | null>(
    null
  )
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteTarget || !tenantId) {
        throw new Error('Thiếu thông tin đơn bán hàng.')
      }
      await saleOrdersRepo.deleteSaleOrder({
        orderId: deleteTarget.id,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale-orders', tenantId] })
      queryClient.invalidateQueries({
        queryKey: ['sale-orders', tenantId, 'history'],
      })
      setDeleteOpen(false)
      setDeleteTarget(null)
      toast.success('Đã xóa đơn bán hàng.')
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
    (order: SaleOrderWithRelations) => {
      if (order.status === '1_DRAFT') {
        navigate({
          to: '/sale-orders',
          search: { orderCode: order.sale_order_code },
        })
      } else {
        navigate({
          to: '/sale-orders/detail',
          search: { orderCode: order.sale_order_code },
        })
      }
    },
    [navigate]
  )

  const handleDelete = useCallback((order: SaleOrderWithRelations) => {
    if (order.status !== '1_DRAFT') {
      toast.error('Chỉ có thể xóa đơn nháp.')
      return
    }
    setDeleteTarget(order)
    setDeleteOpen(true)
  }, [])

  const columns = useMemo(
    () => getSaleOrdersHistoryColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [handleEdit, handleDelete]
  )

  const { data: customers = [] } = useQuery({
    ...getCustomersQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const { data: locations = [] } = useQuery({
    ...getLocationsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const customerOptions = useMemo(
    () =>
      customers.map((customer) => ({
        label: customer.name,
        value: customer.id,
      })),
    [customers]
  )

  const locationOptions = useMemo(
    () =>
      locations.map((location) => ({
        label: location.name,
        value: location.id,
      })),
    [locations]
  )

  const statusOptions = useMemo(
    () => [
      { label: 'Nháp', value: '1_DRAFT' },
      { label: 'Hoàn tất', value: '2_COMPLETE' },
      { label: 'Đã hủy', value: '9_CANCELLED' },
    ],
    []
  )

  const searchValue = useMemo(() => {
    const searchFilter = columnFilters.find(
      (filter) => filter.id === 'sale_order_code'
    )
    return typeof searchFilter?.value === 'string' ? searchFilter.value : ''
  }, [columnFilters])

  const customerIds = useMemo(() => {
    const customerFilter = columnFilters.find(
      (filter) => filter.id === 'customer_name'
    )
    return Array.isArray(customerFilter?.value)
      ? (customerFilter?.value as string[])
      : []
  }, [columnFilters])

  const statusFilters = useMemo(() => {
    const statusFilter = columnFilters.find((filter) => filter.id === 'status')
    return Array.isArray(statusFilter?.value)
      ? (statusFilter?.value as SaleOrderWithRelations['status'][])
      : []
  }, [columnFilters])

  const locationIds = useMemo(() => {
    const locationFilter = columnFilters.find(
      (filter) => filter.id === 'location_name'
    )
    return Array.isArray(locationFilter?.value)
      ? (locationFilter?.value as string[])
      : []
  }, [columnFilters])

  useEffect(() => {
    if (!selectedLocationId) {
      setColumnFilters((prev) => prev.filter((filter) => filter.id !== 'location_name'))
      return
    }
    setColumnFilters((prev) => {
      const withoutLocation = prev.filter((filter) => filter.id !== 'location_name')
      return [...withoutLocation, { id: 'location_name', value: [selectedLocationId] }]
    })
  }, [selectedLocationId])

  const { data: historyResult, isLoading } = useQuery({
    ...getSaleOrdersHistoryQueryOptions({
      tenantId,
      pageIndex: pagination.pageIndex,
      pageSize: pagination.pageSize,
      search: searchValue,
      customerIds,
      locationIds,
      statuses: statusFilters,
      fromDate: formatFromDateParam(fromDate),
      toDate: formatToDateParam(toDate),
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
  }, [columnFilters, sorting, fromDate, toDate])

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

  const handleDeleteDialogOpenChange = useCallback((open: boolean) => {
    setDeleteOpen(open)
    if (!open) {
      setDeleteTarget(null)
    }
  }, [])

  const filters = useMemo(
    () => [
      {
        columnId: 'customer_name',
        title: 'Khách hàng',
        options: customerOptions,
      },
      {
        columnId: 'location_name',
        title: 'Cửa hàng',
        options: locationOptions,
      },
      {
        columnId: 'status',
        title: 'Trạng thái',
        options: statusOptions,
      },
    ],
    [customerOptions, locationOptions, statusOptions]
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
        <div className='flex w-full items-center justify-between gap-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-2xl font-bold tracking-tight'>Lịch sử bán hàng</h2>
            <p className='text-sm text-muted-foreground'>
              Quản lý lịch sử bán hàng tại đây.
            </p>
          </div>
        </div>
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <OfflineOrdersBanner mutations={offlineMutations} tenantId={tenantId} />
        <SaleOrdersHistoryTable
          table={table}
          isLoading={isLoading}
          searchKey='sale_order_code'
          filters={filters}
          fromDate={fromDate}
          toDate={toDate}
          onFromDateChange={setFromDate}
          onToDateChange={setToDate}
          deleteState={deleteState}
        />
      </Main>
    </>
  )
}
