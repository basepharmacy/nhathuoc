import { useMemo } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type VisibilityState,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { formatDateLabel, formatQuantity } from '@/lib/utils'
import { type InventoryBatchWithRelations } from '@/services/supabase/database/repo/inventoryBatchesRepo'
import {
  InventoryTable,
  type FilterOption,
} from './inventory-tables'

export type InventoryProductRow = {
  productId: string
  productName: string
  totalQuantity: number
  batchCount: number
  locations: string[]
  earliestExpiry: string | null
}

function buildProductRows(
  batches: InventoryBatchWithRelations[]
): InventoryProductRow[] {
  const grouped = new Map<
    string,
    {
      row: InventoryProductRow
      locations: Set<string>
    }
  >()

  batches.forEach((batch) => {
    const productId = batch.product_id
    const productName = batch.products?.product_name ?? 'Không rõ'
    const quantity = batch.quantity ?? 0
    const locationName = batch.locations?.name ?? ''
    const expiryDate = batch.expiry_date

    const existing = grouped.get(productId)
    if (!existing) {
      const locations = new Set<string>()
      if (locationName) {
        locations.add(locationName)
      }
      grouped.set(productId, {
        row: {
          productId,
          productName,
          totalQuantity: quantity,
          batchCount: 1,
          locations: [],
          earliestExpiry: expiryDate ?? null,
        },
        locations,
      })
      return
    }

    existing.row.totalQuantity += quantity
    existing.row.batchCount += 1
    if (locationName) {
      existing.locations.add(locationName)
    }

    if (expiryDate) {
      const current = existing.row.earliestExpiry
      if (!current || new Date(expiryDate) < new Date(current)) {
        existing.row.earliestExpiry = expiryDate
      }
    }
  })

  return Array.from(grouped.values()).map(({ row, locations }) => ({
    ...row,
    locations: Array.from(locations),
  }))
}

type Props = {
  batches: InventoryBatchWithRelations[]
  tableState: {
    pagination: PaginationState
    columnFilters: ColumnFiltersState
    columnVisibility: VisibilityState
    onPaginationChange: OnChangeFn<PaginationState>
    onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
    onColumnVisibilityChange: OnChangeFn<VisibilityState>
  }
  pageCount: number
  total: number
  isLoading: boolean
  filters: FilterOption[]
}

const columns: ColumnDef<InventoryProductRow>[] = [
  {
    id: 'search',
    accessorFn: (row) => row.productName,
    header: () => null,
    cell: () => null,
    enableHiding: true,
  },
  {
    id: 'location_id',
    accessorFn: () => '',
    header: () => null,
    cell: () => null,
    enableHiding: true,
  },
  {
    accessorKey: 'productName',
    header: 'Sản phẩm',
    cell: ({ row }) => (
      <span className='font-medium'>{row.original.productName}</span>
    ),
  },
  {
    accessorKey: 'totalQuantity',
    header: 'Tồn kho',
    cell: ({ row }) => formatQuantity(row.original.totalQuantity),
    meta: { className: 'text-end', thClassName: 'text-end' },
  },
  {
    accessorKey: 'batchCount',
    header: 'Số lô',
    cell: ({ row }) => row.original.batchCount,
    meta: { className: 'text-end', thClassName: 'text-end' },
  },
  {
    accessorKey: 'locations',
    header: 'Kho',
    cell: ({ row }) => row.original.locations.join(', ') || '-',
  },
  {
    accessorKey: 'earliestExpiry',
    header: 'HSD gần nhất',
    cell: ({ row }) => formatDateLabel(row.original.earliestExpiry),
  },
]

export function InventoryProductTable({
  batches,
  tableState,
  pageCount,
  total,
  isLoading,
  filters,
}: Props) {
  const productRows = useMemo(() => buildProductRows(batches), [batches])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: productRows,
    columns,
    state: {
      pagination: tableState.pagination,
      columnFilters: tableState.columnFilters,
      columnVisibility: tableState.columnVisibility,
    },
    onPaginationChange: tableState.onPaginationChange,
    onColumnFiltersChange: tableState.onColumnFiltersChange,
    onColumnVisibilityChange: tableState.onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualPagination: true,
    pageCount,
    rowCount: total,
  })

  return (
    <InventoryTable
      table={table}
      isLoading={isLoading}
      searchKey={'search'}
      searchPlaceholder='Tìm sản phẩm...'
      filters={filters}
      emptyMessage='Chưa có dữ liệu tồn kho.'
    />
  )
}
