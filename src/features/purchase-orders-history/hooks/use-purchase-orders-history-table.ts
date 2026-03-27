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
import { formatFromDateParam, formatToDateParam } from '@/lib/utils'
import { usePermissions } from '@/hooks/use-permissions'
import { type PurchaseOrderWithRelations } from '@/services/supabase'
import { type PurchaseOrdersHistoryQueryInput } from '@/services/supabase/database/model'

type FilterOption = { label: string; value: string }

type Supplier = { id: string; name: string }
type Location = { id: string; name: string }

export type PurchaseOrdersHistoryTableInput = {
  tenantId: string
  columns: ColumnDef<PurchaseOrderWithRelations, unknown>[]
  suppliers: Supplier[]
  locations: Location[]
  selectedLocationId?: string | null
  purchasePeriodId?: number
}

export function usePurchaseOrdersHistoryTable({
  tenantId,
  columns,
  suppliers,
  locations,
  selectedLocationId,
  purchasePeriodId,
}: PurchaseOrdersHistoryTableInput) {
  const { locationScope } = usePermissions()
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    locationScope === 'only' ? { location_id: false } : {}
  )
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() =>
    selectedLocationId
      ? [
        {
          id: 'location_id',
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

  // Extract filter values from columnFilters for server-side query
  const searchValue = useMemo(() => {
    const searchFilter = columnFilters.find(
      (filter) => filter.id === 'purchase_order_code'
    )
    return typeof searchFilter?.value === 'string' ? searchFilter.value : ''
  }, [columnFilters])

  const supplierId = useMemo(() => {
    const supplierFilter = columnFilters.find(
      (filter) => filter.id === 'supplier_name'
    )
    return Array.isArray(supplierFilter?.value)
      ? (supplierFilter.value[0] as string | undefined)
      : undefined
  }, [columnFilters])

  const locationId = useMemo(() => {
    const locationFilter = columnFilters.find(
      (filter) => filter.id === 'location_id'
    )
    return Array.isArray(locationFilter?.value)
      ? (locationFilter.value[0] as string | undefined)
      : undefined
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
    supplierId,
    locationId,
    statuses: statusFilters,
    paymentStatuses: paymentStatusFilters,
    fromDate: formatFromDateParam(fromDate),
    toDate: formatToDateParam(toDate),
    purchasePeriodId,
    sorting,
  }), [tenantId, pagination, searchValue, supplierId, locationId, statusFilters, paymentStatusFilters, fromDate, toDate, purchasePeriodId, sorting])

  useEffect(() => {
    if (!selectedLocationId) {
      setColumnFilters((prev) => prev.filter((filter) => filter.id !== 'location_id'))
      return
    }
    setColumnFilters((prev) => {
      const withoutLocation = prev.filter((filter) => filter.id !== 'location_id')
      return [...withoutLocation, { id: 'location_id', value: [selectedLocationId] }]
    })
  }, [selectedLocationId])

  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      pageIndex: 0,
    }))
  }, [columnFilters, sorting, fromDate, toDate, purchasePeriodId])

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
        singleSelect: true,
        options: supplierOptions,
      },
      {
        columnId: 'location_id',
        title: 'Cửa hàng',
        singleSelect: true,
        options: locationOptions,
      },
      {
        columnId: 'payment_status',
        title: 'Thanh toán',
        options: paymentOptions,
      },
    ],
    [supplierOptions, locationOptions, paymentOptions]
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

  return { table, filters, queryParams, fromDate, setFromDate, toDate, setToDate }
}
