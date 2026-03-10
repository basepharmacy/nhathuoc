import { useEffect, useMemo, useState } from 'react'
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { type PurchaseOrderWithRelations } from '@/services/supabase'
import { type PurchaseOrdersHistoryQueryInput } from '@/services/supabase/database/repo/purchaseOrdersRepo'

type FilterOption = { label: string; value: string }

type Supplier = { id: string; name: string }
type Location = { id: string; name: string }

export type PurchaseOrdersHistoryTableInput = {
  tenantId: string
  columns: ColumnDef<PurchaseOrderWithRelations, unknown>[]
  suppliers: Supplier[]
  locations: Location[]
  selectedLocationId?: string | null
}

export function usePurchaseOrdersHistoryTable({
  tenantId,
  columns,
  suppliers,
  locations,
  selectedLocationId,
}: PurchaseOrdersHistoryTableInput) {
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

  // Extract filter values from columnFilters for server-side query
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

  const locationIds = useMemo(() => {
    const locationFilter = columnFilters.find(
      (filter) => filter.id === 'location_name'
    )
    return Array.isArray(locationFilter?.value)
      ? (locationFilter?.value as string[])
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

  const queryParams: PurchaseOrdersHistoryQueryInput = useMemo(() => ({
    tenantId,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    search: searchValue,
    supplierIds,
    locationIds,
    statuses: statusFilters,
    paymentStatuses: paymentStatusFilters,
    sorting,
  }), [tenantId, pagination, searchValue, supplierIds, locationIds, statusFilters, paymentStatusFilters, sorting])

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

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }))
  }, [columnFilters, sorting])

  // Filter options
  const supplierOptions: FilterOption[] = useMemo(
    () =>
      suppliers.map((supplier) => ({
        label: supplier.name,
        value: supplier.id,
      })),
    [suppliers]
  )

  const locationOptions: FilterOption[] = useMemo(
    () =>
      locations.map((location) => ({
        label: location.name,
        value: location.id,
      })),
    [locations]
  )

  const statusOptions: FilterOption[] = useMemo(
    () => [
      { label: 'Nháp', value: '1_DRAFT' },
      { label: 'Đã đặt', value: '2_ORDERED' },
      { label: 'Đã nhập kho', value: '4_STORED' },
      { label: 'Đã hủy', value: '9_CANCELLED' },
    ],
    []
  )

  const paymentOptions: FilterOption[] = useMemo(
    () => [
      { label: 'Chưa thanh toán', value: '1_UNPAID' },
      { label: 'Thanh toán một phần', value: '2_PARTIALLY_PAID' },
      { label: 'Đã thanh toán', value: '3_PAID' },
    ],
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
        columnId: 'location_name',
        title: 'Cửa hàng',
        options: locationOptions,
      },
      {
        columnId: 'status',
        title: 'Trạng thái',
        options: statusOptions,
      },
      {
        columnId: 'payment_status',
        title: 'Thanh toán',
        options: paymentOptions,
      },
    ],
    [supplierOptions, locationOptions, statusOptions, paymentOptions]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: [] as PurchaseOrderWithRelations[],
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
    pageCount: 1,
    rowCount: 0,
  })

  return { table, filters, queryParams }
}
