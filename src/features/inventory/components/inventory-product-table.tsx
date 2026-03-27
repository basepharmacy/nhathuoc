import { useMemo } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useNavigate } from '@tanstack/react-router'
import { SquarePen } from 'lucide-react'
import { formatCurrency, formatDateLabel } from '@/lib/utils'
import { DataTableColumnHeader } from '@/components/data-table'
import { type InventoryProductsListItem } from '@/services/supabase/database/model'
import { Badge } from '@/components/ui/badge'
import {
  DataTableRowActions,
  type RowAction,
} from '@/components/data-table-row-actions'
import { usePermissions } from '@/hooks/use-permissions'
import {
  InventoryTable,
  type FilterOption,
} from './inventory-tables'
import { QuantityWithUnitCell } from './quantity-with-unit-cell'

type Props = {
  rows: InventoryProductsListItem[]
  tableState: {
    pagination: PaginationState
    columnFilters: ColumnFiltersState
    columnVisibility: VisibilityState
    sorting: SortingState
    onPaginationChange: OnChangeFn<PaginationState>
    onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
    onSortingChange: OnChangeFn<SortingState>
  }
  pageCount: number
  total: number
  isLoading: boolean
  filters: FilterOption[]
}

function getExpiryBadge(dateStr: string | null | undefined) {
  if (!dateStr) return null
  const now = new Date()
  const expiry = new Date(dateStr)
  const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  if (diffDays < 0) return <Badge variant='destructive'>Hết hạn</Badge>
  if (diffDays <= 7) return <Badge className='border-transparent bg-orange-500 text-white'>Còn 7 ngày</Badge>
  if (diffDays <= 30) return <Badge className='border-transparent bg-amber-500 text-white'>Còn 1 tháng</Badge>
  if (diffDays <= 90) return <Badge className='border-transparent bg-yellow-500 text-white'>Còn 3 tháng</Badge>
  return null
}

function createColumns(
  onAdjust: (row: InventoryProductsListItem) => void,
  showActions: boolean
): ColumnDef<InventoryProductsListItem>[] {
  return [
    {
      accessorKey: 'product_name',
      header: 'Sản phẩm',
      cell: ({ row }) => (
        <div className='flex space-x-2'>
          <span className='truncate font-medium'>{row.original.product_name}</span>
          {row.original.product_status === '3_INACTIVE' && <Badge variant='destructive'>Ngừng bán</Badge>}
        </div>
      ),
    },
    {
      accessorKey: 'nearest_expiry_date',
      header: ({ column }) => <DataTableColumnHeader column={column} title='HSD gần nhất' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <span>{formatDateLabel(row.original.nearest_expiry_date)}</span>
          {getExpiryBadge(row.original.nearest_expiry_date)}
        </div>
      ),
    },
    {
      accessorKey: 'quantity',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Tồn kho' className='justify-end' />,
      cell: ({ row }) => (
        <QuantityWithUnitCell value={row.original.quantity} units={row.original.product_units ?? []} />
      ),
      meta: { className: 'text-end', thClassName: 'text-end' },
    },
    {
      accessorKey: 'cumulative_quantity',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Tổng nhập' className='justify-end' />,
      cell: ({ row }) => (
        <QuantityWithUnitCell value={row.original.cumulative_quantity} units={row.original.product_units ?? []} />
      ),
      meta: { className: 'text-end', thClassName: 'text-end' },
    },
    {
      accessorKey: 'average_cost_price',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Giá nhập TB' className='justify-end' />,
      cell: ({ row }) => (
        <span className='tabular-nums'>
          {formatCurrency(row.original.average_cost_price, { fallback: '0' })}đ
        </span>
      ),
      meta: { className: 'text-end', thClassName: 'text-end' },
    },
    {
      accessorKey: 'batch_numbers',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Số lô' className='justify-end' />,
      cell: ({ row }) => row.original.batch_numbers,
      meta: { className: 'text-end', thClassName: 'text-end' },
    },
    {
      accessorKey: 'location_id',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Cửa hàng' />,
      cell: ({ row }) => row.original.location_name || '-',
    },
    {
      id: 'search',
      accessorFn: (row) => row.product_name,
      header: () => null,
      cell: () => null,
      enableHiding: true,
    },
    {
      id: 'stock_status',
      accessorFn: () => '',
      header: () => null,
      cell: () => null,
      enableHiding: true,
    },
    {
      id: 'expiry_status',
      accessorFn: () => '',
      header: () => null,
      cell: () => null,
      enableHiding: true,
    },
    ...(showActions
      ? [
        {
          id: 'actions',
          header: () => <div className='text-right'>Thao tác</div>,
          cell: ({ row }) => {
            const actions: RowAction[] = [
              {
                label: 'Điều chỉnh',
                icon: SquarePen,
                onClick: () => onAdjust(row.original),
              },
            ]
            return (
              <div className='flex justify-end'>
                <DataTableRowActions actions={actions} />
              </div>
            )
          },
          meta: {
            className: 'sticky right-0 bg-background shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]',
            thClassName: 'sticky right-0 bg-background shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]',
          },
        } satisfies ColumnDef<InventoryProductsListItem>,
      ]
      : []),
  ]
}

export function InventoryProductTable({
  rows,
  tableState,
  pageCount,
  total,
  isLoading,
  filters,
}: Props) {
  const navigate = useNavigate()

  const handleAdjust = (row: InventoryProductsListItem) => {
    navigate({
      to: '/inventory/adjustments/new',
      search: { productId: row.id },
    })
  }

  const { canEdit } = usePermissions()
  const allowAdjust = canEdit('stock_adjustments')
  const columns = useMemo(() => createColumns(handleAdjust, allowAdjust), [allowAdjust])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: rows,
    columns,
    state: {
      pagination: tableState.pagination,
      columnFilters: tableState.columnFilters,
      columnVisibility: tableState.columnVisibility,
      sorting: tableState.sorting,
    },
    onPaginationChange: tableState.onPaginationChange,
    onColumnFiltersChange: tableState.onColumnFiltersChange,
    onSortingChange: tableState.onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
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
