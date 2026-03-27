import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import {
  type ActivityHistoryWithRelations,
  activityTypeLabels,
} from '@/services/supabase/'

const activityTypeColors: Record<
  ActivityHistoryWithRelations['activity_type'],
  string
> = {
  PURCHASE_ORDER_ORDERED:
    'bg-blue-100/40 text-blue-900 dark:text-blue-200 border-blue-200',
  PURCHASE_ORDER_STORED:
    'bg-emerald-100/40 text-emerald-900 dark:text-emerald-200 border-emerald-200',
  PURCHASE_ORDER_CANCELLED:
    'bg-rose-200/40 text-rose-900 dark:text-rose-100 border-rose-300',
  SALE_ORDER_COMPLETED:
    'bg-emerald-100/40 text-emerald-900 dark:text-emerald-200 border-emerald-200',
  SALE_ORDER_CANCELLED:
    'bg-rose-200/40 text-rose-900 dark:text-rose-100 border-rose-300',
  STOCK_ADJUSTMENT_CREATED:
    'bg-amber-100/40 text-amber-900 dark:text-amber-200 border-amber-200',
  SUPPLIER_PAYMENT_CREATED:
    'bg-blue-100/40 text-blue-900 dark:text-blue-200 border-blue-200',
  SUPPLIER_PAYMENT_DELETED:
    'bg-rose-200/40 text-rose-900 dark:text-rose-100 border-rose-300',
}

const formatDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const activityHistoryColumns: ColumnDef<ActivityHistoryWithRelations>[] =
  [
    {
      accessorKey: 'activity_type',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Hoạt động' />
      ),
      cell: ({ row }) => {
        const type = row.getValue(
          'activity_type'
        ) as ActivityHistoryWithRelations['activity_type']
        return (
          <Badge
            variant='outline'
            className={`text-xs font-medium ${activityTypeColors[type]}`}
          >
            {activityTypeLabels[type]}
          </Badge>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: 'reference_code',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Mã tham chiếu' />
      ),
      cell: ({ row }) => (
        <span className='text-sm font-mono'>
          {row.getValue('reference_code') ?? '—'}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Thời gian' />
      ),
      cell: ({ row }) => (
        <span className='text-sm text-nowrap'>
          {formatDate(row.getValue('created_at'))}
        </span>
      ),
    },
  ]
