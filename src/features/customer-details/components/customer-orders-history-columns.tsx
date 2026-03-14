import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type SaleOrderWithRelations } from '@/services/supabase'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { SaleOrdersHistoryRowActions } from '@/features/sale-orders-history/components/sale-orders-history-row-actions.tsx'

const orderStatusLabels: Record<SaleOrderWithRelations['status'], string> = {
  '1_DRAFT': 'Nháp',
  '2_COMPLETE': 'Hoàn tất',
  '7_DAV_ERROR': 'Lỗi DAV',
  '8_INSUFFICIENT_STOCK': 'Thiếu tồn kho',
  '9_CANCELLED': 'Đã hủy',
}

const orderStatusColors: Record<SaleOrderWithRelations['status'], string> = {
  '1_DRAFT': 'bg-neutral-200/60 text-foreground border-neutral-300',
  '2_COMPLETE': 'bg-emerald-100/40 text-emerald-900 dark:text-emerald-200 border-emerald-200',
  '7_DAV_ERROR': 'bg-yellow-100/40 text-yellow-900 dark:text-yellow-200 border-yellow-200',
  '8_INSUFFICIENT_STOCK': 'bg-orange-100/40 text-orange-900 dark:text-orange-200 border-orange-200',
  '9_CANCELLED': 'bg-rose-200/40 text-rose-900 dark:text-rose-100 border-rose-300',
}

const formatIssuedDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN').format(date)
}

type CustomerOrdersHistoryColumnHandlers = {
  onEdit: (order: SaleOrderWithRelations) => void
  onDelete: (order: SaleOrderWithRelations) => void
}

export const getCustomerOrdersHistoryColumns = (
  handlers: CustomerOrdersHistoryColumnHandlers
): ColumnDef<SaleOrderWithRelations>[] => [
    {
      accessorKey: 'sale_order_code',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Mã đơn' />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-44 ps-3'>
          {row.getValue('sale_order_code')}
        </LongText>
      ),
      meta: {
        className: cn(
          'drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]',
          'ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none'
        ),
      },
      enableHiding: false,
    },
    {
      id: 'location_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Cửa hàng' />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>{row.original.location?.name ?? '—'}</span>
      ),
      meta: { label: 'Cửa hàng' },
      enableSorting: false,
    },
    {
      id: 'amount_due',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Cần thanh toán' />
      ),
      cell: ({ row }) => {
        const totalAmount = row.original.total_amount ?? 0
        const discount = row.original.discount ?? 0
        return (
          <span className='text-sm text-nowrap'>
            {formatCurrency(Math.max(0, totalAmount - discount))}
          </span>
        )
      },
      meta: { label: 'Cần thanh toán' },
    },
    {
      accessorKey: 'customer_paid_amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Đã thanh toán' />
      ),
      cell: ({ row }) => (
        <span className='text-sm text-nowrap'>
          {formatCurrency(row.getValue('customer_paid_amount'))}
        </span>
      ),
      meta: { label: 'Đã thanh toán' },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Trạng thái' />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as SaleOrderWithRelations['status']
        return (
          <Badge
            variant='outline'
            className={cn('text-sm font-medium', orderStatusColors[status])}
          >
            {orderStatusLabels[status]}
          </Badge>
        )
      },
      meta: { label: 'Trạng thái' },
      enableSorting: false,
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'issued_at',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Ngày bán' />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>{formatIssuedDate(row.getValue('issued_at'))}</span>
      ),
      meta: { label: 'Ngày bán' },
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Thao tác</div>,
      cell: ({ row }) => (
        <div className='flex justify-end'>
          <SaleOrdersHistoryRowActions
            row={row}
            onEdit={handlers.onEdit}
            onDelete={handlers.onDelete}
          />
        </div>
      ),
      meta: {
        className: 'text-right',
        thClassName: 'text-right',
      },
      enableSorting: false,
      enableHiding: false,
    },
  ]
