import { type ColumnDef } from '@tanstack/react-table'
import { formatCurrency, formatDateTimeLabel, formatQuantity } from '@/lib/utils'
import { type StockAdjustmentWithRelations } from '@/services/supabase/database/repo/stockAdjustmentsRepo'
import { Badge } from '@/components/ui/badge'
import { getReasonCodeLabel } from '../data/reason-code'
import { DataTableRowActions } from './data-table-row-actions'

export const stockAdjustmentsColumns: ColumnDef<StockAdjustmentWithRelations>[] = [
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
    header: 'Mã lý do',
    cell: ({ row }) => getReasonCodeLabel(row.original.reason_code),
  },
  {
    accessorKey: 'reason',
    header: 'Lý do',
    cell: ({ row }) => (
      <span className='max-w-48 truncate'>
        {row.original.reason ?? '-'}
      </span>
    ),
  },
  {
    id: 'location_name',
    header: 'Cửa hàng',
    cell: ({ row }) => row.original.locations?.name ?? '-',
  },
  {
    accessorKey: 'created_at',
    header: 'Ngày tạo',
    cell: ({ row }) => formatDateTimeLabel(row.original.created_at),
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
