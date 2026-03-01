import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type VisibilityState,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { formatDateLabel, formatDateTimeLabel, formatQuantity } from '@/lib/utils'
import { type InventoryBatchWithRelations } from '@/services/supabase/database/repo/inventoryBatchesRepo'
import {
  InventoryTable,
  type FilterOption,
} from './inventory-tables'

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

const columns: ColumnDef<InventoryBatchWithRelations>[] = [
  {
    id: 'search',
    accessorFn: (row) => `${row.batch_code} ${row.products?.product_name ?? ''}`,
    header: () => null,
    cell: () => null,
    enableHiding: true,
  },
  {
    id: 'location_id',
    accessorFn: (row) => row.location_id ?? '',
    header: () => null,
    cell: () => null,
    enableHiding: true,
  },
  {
    id: 'product_name',
    header: 'Sản phẩm',
    cell: ({ row }) => (
      <span className='font-medium'>
        {row.original.products?.product_name ?? 'Không rõ'}
      </span>
    ),
  },
  {
    accessorKey: 'batch_code',
    header: 'Lô',
  },
  {
    accessorKey: 'expiry_date',
    header: 'HSD',
    cell: ({ row }) => formatDateLabel(row.original.expiry_date),
  },
  {
    accessorKey: 'quantity',
    header: 'Tồn kho',
    cell: ({ row }) => formatQuantity(row.original.quantity),
    meta: { className: 'text-end', thClassName: 'text-end' },
  },
  {
    id: 'location_name',
    header: 'Kho',
    cell: ({ row }) => row.original.locations?.name ?? '-',
  },
  {
    accessorKey: 'updated_at',
    header: 'Cập nhật',
    cell: ({ row }) => formatDateTimeLabel(row.original.updated_at),
  },
]

export function InventoryBatchTable({
  batches,
  tableState,
  pageCount,
  total,
  isLoading,
  filters,
}: Props) {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: batches,
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
      searchPlaceholder='Tìm sản phẩm hoặc mã lô...'
      filters={filters}
      emptyMessage='Chưa có dữ liệu tồn kho.'
    />
  )
}
