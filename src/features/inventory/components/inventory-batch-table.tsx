import { useMemo, useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  formatCurrency,
  formatDateLabel,
  formatDateTimeLabel,
  formatQuantity,
} from '@/lib/utils'
import { Pencil } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  DataTableRowActions,
  type RowAction,
} from '@/components/data-table-row-actions'
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
  onAdjust: (batch: InventoryBatchWithRelations) => void,
  showActions: boolean
): ColumnDef<InventoryBatchWithRelations>[] {
  return [
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
      accessorKey: 'batch_code',
      header: 'Lô',
    },
    {
      id: 'product_name',
      header: 'Sản phẩm',
      cell: ({ row }) => (
        <div className='flex space-x-2'>
          <span className='truncate font-medium'>{row.original.products?.product_name ?? 'Không rõ'}</span>
          {row.original.products?.status === '3_INACTIVE' && <Badge variant='destructive'>Ngừng bán</Badge>}
        </div>
      ),
    },
    {
      accessorKey: 'Hạn sử dụng',
      header: 'HSD',
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <span>{formatDateLabel(row.original.expiry_date)}</span>
          {getExpiryBadge(row.original.expiry_date)}
        </div>
      ),
    },
    {
      accessorKey: 'Tồn kho',
      header: 'Tồn kho',
      cell: ({ row }) => (
        <span className='tabular-nums'>{formatQuantity(row.original.quantity) + ' ' + (row.original.products?.product_units?.find(unit => unit.is_base_unit)?.unit_name ?? '')}</span>
      ),
      meta: { className: 'text-end', thClassName: 'text-end' },
    },
    {
      accessorKey: 'Tổng nhập kho',
      header: 'Tổng nhập',
      cell: ({ row }) => formatQuantity(row.original.cumulative_quantity),
      meta: { className: 'text-end', thClassName: 'text-end' },
    },
    {
      accessorKey: 'Giá nhập TB',
      header: 'Giá nhập TB',
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
      cell: ({ row }) => row.original.locations?.name ?? '-',
    },
    {
      accessorKey: 'Cập nhật',
      header: 'Cập nhật',
      cell: ({ row }) => formatDateTimeLabel(row.original.updated_at),
    },
    ...(showActions
      ? [
        {
          id: 'actions',
          cell: ({ row }: { row: import('@tanstack/react-table').Row<InventoryBatchWithRelations> }) => {
            const actions: RowAction[] = [
              {
                label: 'Điều chỉnh',
                icon: Pencil,
                onClick: () => onAdjust(row.original),
              },
            ]
            return <DataTableRowActions actions={actions} />
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
      productName: batch.products?.product_name ?? 'Không rõ',
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
