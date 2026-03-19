import { useMemo } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useNavigate } from '@tanstack/react-router'
import { Pencil } from 'lucide-react'
import { formatCurrency, formatDateLabel, formatQuantity } from '@/lib/utils'
import { type InventoryProductsListItem } from '@/services/supabase/database/repo/inventoryBatchesRepo'
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

type Props = {
  rows: InventoryProductsListItem[]
  tableState: {
    pagination: PaginationState
    columnFilters: ColumnFiltersState
    onPaginationChange: OnChangeFn<PaginationState>
    onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
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
      cell: ({ row }) => (
        <span className='tabular-nums'>
          {formatQuantity(row.original.totalQuantity) + ' ' + row.original.base_unit_name}
        </span>
      ),
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
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <span>{formatDateLabel(row.original.earliestExpiry)}</span>
          {getExpiryBadge(row.original.earliestExpiry)}
        </div>
      ),
    },
    ...(showActions
      ? [
        {
          id: 'actions',
          cell: ({ row }: { row: import('@tanstack/react-table').Row<InventoryProductsListItem> }) => {
            const actions: RowAction[] = [
              {
                label: 'Điều chỉnh',
                icon: Pencil,
                onClick: () => onAdjust(row.original),
              },
            ]
            return <DataTableRowActions actions={actions} />
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
      search: { productId: row.productId },
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
    },
    onPaginationChange: tableState.onPaginationChange,
    onColumnFiltersChange: tableState.onColumnFiltersChange,
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
