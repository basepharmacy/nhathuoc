import { type ColumnDef } from '@tanstack/react-table'
import { formatCurrency, formatDateTimeLabel, formatQuantity } from '@/lib/utils'
import { type StockAdjustmentWithRelations } from '@/services/supabase/'
import { Badge } from '@/components/ui/badge'
import { getReasonCodeLabel } from '../data/reason-code'
import { StockAdjustmentsRowActions } from './stock-adjustments-row-actions'
import { DataTableColumnHeader } from '@/components/data-table/column-header'

type StockAdjustmentsColumnHandlers = {
  onCancel?: (row: StockAdjustmentWithRelations) => void
}

export function createStockAdjustmentsColumns(
  handlers: StockAdjustmentsColumnHandlers
): ColumnDef<StockAdjustmentWithRelations>[] {
  return [
    {
      id: 'search',
      accessorFn: (row) => `${row.batch_code} ${row.products?.product_name ?? ''}`,
      header: () => null,
      cell: () => null,
      enableHiding: true,
    },
    {
      id: 'adjustment_type',
      accessorFn: (row) => (row.quantity > 0 ? 'increase' : 'decrease'),
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
      header: 'Mã lô',
    },
    {
      accessorKey: 'quantity',
      header: 'Số lượng',
      cell: ({ row }) => {
        const qty = row.original.quantity
        return (
          <Badge variant={qty >= 0 ? 'default' : 'destructive'} className='tabular-nums'>
            {qty >= 0 ? '+' : ''}{formatQuantity(qty)}
          </Badge>
        )
      },
      meta: { className: 'text-center', thClassName: 'text-center' },
    },
    {
      accessorKey: 'cost_price',
      header: 'Giá nhập',
      cell: ({ row }) => (
        <span className='tabular-nums'>
          {formatCurrency(row.original.cost_price)}đ
        </span>
      ),
      meta: { className: 'text-end', thClassName: 'text-end' },
    },
    {
      accessorKey: 'reason_code',
      header: 'Lý do',
      cell: ({ row }) => getReasonCodeLabel(row.original.reason_code),
    },
    {
      accessorKey: 'reason',
      header: 'Ghi chú',
      cell: ({ row }) => (
        <span className='max-w-48 truncate'>
          {row.original.reason ?? '-'}
        </span>
      ),
    },
    {
      id: 'location_id',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Cửa hàng' />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>{row.original.locations?.name ?? '—'}</span>
      ),
      meta: { label: 'Cửa hàng' },
      enableSorting: false,
    },
    {
      accessorKey: 'created_at',
      header: 'Ngày tạo',
      cell: ({ row }) => formatDateTimeLabel(row.original.created_at),
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Thao tác</div>,
      cell: ({ row }) => (
        <div className='flex justify-end'>
          <StockAdjustmentsRowActions
            row={row}
            onCancel={handlers.onCancel}
          />
        </div>
      ),
      meta: {
        className: 'sticky right-0 bg-background shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]',
        thClassName: 'sticky right-0 bg-background shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]',
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]
}
