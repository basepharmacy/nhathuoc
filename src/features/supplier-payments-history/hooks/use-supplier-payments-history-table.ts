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
import { type SupplierPaymentWithSupplier, type AllSupplierPaymentsHistoryQueryInput } from '@/services/supabase/database/model'

type FilterOption = { label: string; value: string }

type Supplier = { id: string; name: string }

export type SupplierPaymentsHistoryTableInput = {
  tenantId: string
  columns: ColumnDef<SupplierPaymentWithSupplier, unknown>[]
  suppliers: Supplier[]
  purchasePeriodId?: number
}

export function useSupplierPaymentsHistoryTable({
  tenantId,
  columns,
  suppliers,
  purchasePeriodId,
}: SupplierPaymentsHistoryTableInput) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
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
      (filter) => filter.id === 'reference_code'
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

  const queryParams: AllSupplierPaymentsHistoryQueryInput = useMemo(() => ({
    tenantId,
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    search: searchValue,
    supplierIds,
    fromDate: formatFromDateParam(fromDate),
    toDate: formatToDateParam(toDate),
    purchasePeriodId,
    sorting,
  }), [tenantId, pagination, searchValue, supplierIds, fromDate, toDate, purchasePeriodId, sorting])

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

  const filters = useMemo(
    () => [
      {
        columnId: 'supplier_name',
        title: 'Nhà cung cấp',
        options: supplierOptions,
      },
    ],
    [supplierOptions]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: [] as SupplierPaymentWithSupplier[],
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

  return {
    table,
    filters,
    queryParams,
    fromDate,
    setFromDate,
    toDate,
    setToDate,
  }
}
