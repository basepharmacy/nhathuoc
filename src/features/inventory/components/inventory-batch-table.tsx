import { useMemo, useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type VisibilityState,
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
      accessorKey: 'expiry_date',
      header: 'HSD',
      cell: ({ row }) => formatDateLabel(row.original.expiry_date),
    },
    {
      accessorKey: 'quantity',
      header: 'Tồn kho',
      cell: ({ row }) => (
        <span className='tabular-nums'>{formatQuantity(row.original.quantity) + ' ' + (row.original.products?.product_units?.find(unit => unit.is_base_unit)?.unit_name ?? '')}</span>
      ),
      meta: { className: 'text-end', thClassName: 'text-end' },
    },
    {
      accessorKey: 'cumulative_quantity',
      header: 'Tổng nhập',
      cell: ({ row }) => formatQuantity(row.original.cumulative_quantity),
      meta: { className: 'text-end', thClassName: 'text-end' },
    },
    {
      accessorKey: 'average_cost_price',
      header: 'Giá nhập TB',
      cell: ({ row }) => (
        <span className='tabular-nums'>
          {formatCurrency(row.original.average_cost_price, { fallback: '0' })}đ
        </span>
      ),
      meta: { className: 'text-end', thClassName: 'text-end' },
    },
    {
      id: 'location_name',
      header: 'Cửa hàng',
      cell: ({ row }) => row.original.locations?.name ?? '-',
    },
    {
      accessorKey: 'updated_at',
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
  const allowAdjust = canEdit('products')
  const columns = useMemo(() => createColumns(handleAdjust, allowAdjust), [allowAdjust])

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
