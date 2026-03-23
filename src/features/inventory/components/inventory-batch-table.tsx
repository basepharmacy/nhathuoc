import { useMemo, useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  formatCurrency,
  formatDateLabel,
} from '@/lib/utils'
import { SquarePen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import {
  DataTableRowActions,
  type RowAction,
} from '@/components/data-table-row-actions'
import { QuantityWithUnitCell } from './quantity-with-unit-cell'
import { usePermissions } from '@/hooks/use-permissions'
import { type InventoryBatchWithRelations } from '@/services/supabase/database/repo/inventoryBatchesRepo'
import {
  StockAdjustmentsActionDialog,
  type StockAdjustmentInitialBatch,
} from '@/features/stock-adjustments/components/stock-adjustments-action-dialog'
import {
  InventoryTable,
  type FilterOption,
} from './inventory-tables'

type Props = {
  batches: InventoryBatchWithRelations[]
  tableState: {
    pagination: PaginationState
    columnFilters: ColumnFiltersState
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
  onAdjust: (batch: InventoryBatchWithRelations) => void,
  showActions: boolean
): ColumnDef<InventoryBatchWithRelations>[] {
  return [
    {
      accessorKey: 'batch_code',
      header: 'Lô',
    },
    {
      id: 'product_name',
      header: 'Sản phẩm',
      cell: ({ row }) => (
        <div className='flex space-x-2'>
          <span className='truncate font-medium'>{row.original.product_name ?? 'Không rõ'}</span>
          {row.original.product_status === '3_INACTIVE' && <Badge variant='destructive'>Ngừng bán</Badge>}
        </div>
      ),
    },
    {
      id: 'expiry_date',
      accessorKey: 'expiry_date',
      header: ({ column }) => <DataTableColumnHeader column={column} title='HSD' />,
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <span>{formatDateLabel(row.original.expiry_date)}</span>
          {getExpiryBadge(row.original.expiry_date)}
        </div>
      ),
    },
    {
      id: 'quantity',
      accessorKey: 'quantity',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Tồn kho' className='justify-end' />,
      cell: ({ row }) => (
        <QuantityWithUnitCell value={row.original.quantity} units={row.original.product_units ?? []} />
      ),
      meta: { className: 'text-end', thClassName: 'text-end' },
    },
    {
      id: 'cumulative_quantity',
      accessorKey: 'cumulative_quantity',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Tổng nhập' className='justify-end' />,
      cell: ({ row }) => (
        <QuantityWithUnitCell value={row.original.cumulative_quantity} units={row.original.product_units ?? []} />
      ),
      meta: { className: 'text-end', thClassName: 'text-end' },
    },
    {
      id: 'average_cost_price',
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
      id: 'Cửa hàng',
      header: 'Cửa hàng',
      cell: ({ row }) => row.original.location_name ?? '-',
    },
    {
      id: 'search',
      accessorFn: (row) => `${row.batch_code} ${row.product_name ?? ''}`,
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
        } satisfies ColumnDef<InventoryBatchWithRelations>,
      ]
      : []),
  ]
}

export function InventoryBatchTable({
  batches,
  tableState,
  pageCount,
  total,
  isLoading,
  filters,
}: Props) {
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [selectedBatch, setSelectedBatch] = useState<StockAdjustmentInitialBatch | null>(null)

  const handleAdjust = (batch: InventoryBatchWithRelations) => {
    setSelectedBatch({
      productId: batch.product_id,
      productName: batch.product_name ?? 'Không rõ',
      locationId: batch.location_id ?? '',
      batchId: batch.id,
      batchCode: batch.batch_code,
      expiryDate: batch.expiry_date,
      costPrice: batch.average_cost_price,
      quantity: batch.quantity,
    })
    setAdjustDialogOpen(true)
  }

  const { canEdit } = usePermissions()
  const allowAdjust = canEdit('stock_adjustments')
  const columns = useMemo(() => createColumns(handleAdjust, allowAdjust), [allowAdjust])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: batches,
    columns,
    state: {
      pagination: tableState.pagination,
      columnFilters: tableState.columnFilters,
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
    <>
      <InventoryTable
        table={table}
        isLoading={isLoading}
        searchKey={'search'}
        searchPlaceholder='Tìm sản phẩm...'
        filters={filters}
        emptyMessage='Chưa có dữ liệu tồn kho.'
      />
      {selectedBatch && (
        <StockAdjustmentsActionDialog
          open={adjustDialogOpen}
          onOpenChange={(open) => {
            setAdjustDialogOpen(open)
            if (!open) setSelectedBatch(null)
          }}
          batch={selectedBatch}
        />
      )}
    </>
  )
}
