import { type ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/ui/long-text.tsx'
import { type SaleOrderWithRelations } from '@/services/supabase/'
import { formatCurrency } from '@/lib/utils'
import { SaleOrdersHistoryRowActions } from './sale-orders-history-row-actions.tsx'
import { saleOrderStatusLabels, saleOrderStatusColors } from '../sale-order-status'

const formatIssuedDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN').format(date)
}

type SaleOrdersHistoryColumnHandlers = {
  onEdit: (order: SaleOrderWithRelations) => void
  onDelete: (order: SaleOrderWithRelations) => void
}

export const getSaleOrdersHistoryColumns = (
  handlers: SaleOrdersHistoryColumnHandlers
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
      id: 'customer_name',
      accessorFn: (row) => row.customer?.name ?? '—',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Khách hàng' />
      ),
      cell: ({ row }) => {
        const customerId = row.original.customer?.id
        const name = row.getValue<string>('customer_name')
        if (!customerId) return <LongText className='max-w-52'>{name}</LongText>
        return (
          <Link
            to='/customers/$customerId'
            params={{ customerId: String(customerId) }}
            className='max-w-52 truncate text-sm font-medium hover:underline'
          >
            {name}
          </Link>
        )
      },
      meta: { label: 'Khách hàng' },
      enableSorting: false,
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      id: 'location_id',
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
        <DataTableColumnHeader column={column} title='Số tiền' />
      ),
      cell: ({ row }) => {
        const totalAmount = row.original.total_amount ?? 0
        return (
          <span className='text-sm text-nowrap'>
            {formatCurrency(totalAmount)}
          </span>
        )
      },
      meta: { label: 'Số tiền' },
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
            className={cn('text-sm font-medium', saleOrderStatusColors[status])}
          >
            {saleOrderStatusLabels[status]}
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
            onDelete={handlers.onDelete}
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
