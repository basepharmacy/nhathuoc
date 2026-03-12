import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type VisibilityState,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { formatCurrency, formatDateLabel, formatQuantity } from '@/lib/utils'
import { type InventoryProductsListItem } from '@/services/supabase/database/repo/inventoryBatchesRepo'
import {
  InventoryTable,
  type FilterOption,
} from './inventory-tables'
import { Badge } from '@/components/ui/badge'

type Props = {
  rows: InventoryProductsListItem[]
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

const columns: ColumnDef<InventoryProductsListItem>[] = [
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
      <div className='flex space-x-2'>
        <span className='truncate font-medium'>{row.original.productName}</span>
        {row.original.status === '3_INACTIVE' && <Badge variant='destructive'>Ngừng bán</Badge>}
      </div>
    ),
  },
  {
    accessorKey: 'totalQuantity',
    header: 'Tồn kho',
    cell: ({ row }) => formatQuantity(row.original.totalQuantity),
    meta: { className: 'text-end', thClassName: 'text-end' },
  },
  {
    accessorKey: 'totalCumulativeQuantity',
    header: 'Tổng nhập',
    cell: ({ row }) => formatQuantity(row.original.totalCumulativeQuantity),
    meta: { className: 'text-end', thClassName: 'text-end' },
  },
  {
    accessorKey: 'averageCostPrice',
    header: 'Giá nhập TB',
    cell: ({ row }) => (
      <span className='tabular-nums'>
        {formatCurrency(row.original.averageCostPrice, { fallback: '0' })}đ
      </span>
    ),
    meta: { className: 'text-end', thClassName: 'text-end' },
  },
  {
    accessorKey: 'totalValue',
    header: 'Giá trị tồn kho',
    cell: ({ row }) => (
      <span className='tabular-nums'>
        {formatCurrency(
          row.original.averageCostPrice * row.original.totalQuantity,
          { fallback: '0' }
        )}đ
      </span>
    ),
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
    header: 'Cửa hàng',
    cell: ({ row }) => row.original.locations.join(', ') || '-',
  },
  {
    accessorKey: 'earliestExpiry',
    header: 'HSD gần nhất',
    cell: ({ row }) => formatDateLabel(row.original.earliestExpiry),
  },
]

export function InventoryProductTable({
  rows,
  tableState,
  pageCount,
  total,
  isLoading,
  filters,
}: Props) {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rows,
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
