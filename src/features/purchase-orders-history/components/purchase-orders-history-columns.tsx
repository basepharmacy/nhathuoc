import { type ColumnDef } from '@tanstack/react-table'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type PurchaseOrderWithRelations } from '@/services/supabase/database/repo/purchaseOrdersRepo'
import { formatCurrency } from '@/lib/utils'
import { PurchaseOrdersHistoryRowActions } from './purchase-orders-history-row-actions'
import {
  purchaseOrderStatusLabels,
  purchaseOrderStatusColors,
  purchasePaymentStatusLabels,
  purchasePaymentStatusColors,
} from '../purchase-order-status'

const formatIssuedDate = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN').format(date)
}

type PurchaseOrdersHistoryColumnHandlers = {
  onEdit: (order: PurchaseOrderWithRelations) => void
  onDelete: (order: PurchaseOrderWithRelations) => void
}

export const getPurchaseOrdersHistoryColumns = (
  handlers: PurchaseOrdersHistoryColumnHandlers
): ColumnDef<PurchaseOrderWithRelations>[] => [
    {
      accessorKey: 'purchase_order_code',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Mã phiếu' />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-44 ps-3'>
          {row.getValue('purchase_order_code')}
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
      id: 'supplier_name',
      accessorFn: (row) => row.supplier?.name ?? '—',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Nhà cung cấp' />
      ),
      cell: ({ row }) => (
        <Link
          to='/suppliers/$supplierId'
          params={{ supplierId: row.original.supplier?.id ?? '' }}
          className='hover:underline font-medium'
        >
          <LongText className='max-w-52'>
            {row.getValue('supplier_name')}
          </LongText>
        </Link>
      ),
      meta: { label: 'Nhà cung cấp' },
      enableSorting: false,
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
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
        return (
          <span className='text-sm text-nowrap'>
            {formatCurrency(totalAmount)}
          </span>
        )
      },
      meta: { label: 'Cần thanh toán' },
    },
    {
      accessorKey: 'paid_amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Đã thanh toán' />
      ),
      cell: ({ row }) => (
        <span className='text-sm text-nowrap'>
          {formatCurrency(row.getValue('paid_amount'))}
        </span>
      ),
      meta: { label: 'Đã thanh toán' },
    },
    {
      accessorKey: 'payment_status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Thanh toán' />
      ),
      cell: ({ row }) => {
        const status = row.getValue('payment_status') as PurchaseOrderWithRelations['payment_status']
        return (
          <Badge variant='outline' className={cn('text-sm font-medium', purchasePaymentStatusColors[status])}>
            {purchasePaymentStatusLabels[status]}
          </Badge>
        )
      },
      meta: { label: 'Thanh toán' },
      enableSorting: false,
      filterFn: (row, id, value) => value.includes(row.getValue(id)),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Trạng thái' />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as PurchaseOrderWithRelations['status']
        return (
          <Badge variant='outline' className={cn('text-sm font-medium', purchaseOrderStatusColors[status])}>
            {purchaseOrderStatusLabels[status]}
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
        <DataTableColumnHeader column={column} title='Ngày nhập' />
      ),
      cell: ({ row }) => (
        <span className='text-sm'>{formatIssuedDate(row.getValue('issued_at'))}</span>
      ),
      meta: { label: 'Ngày nhập' },
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Thao tác</div>,
      cell: ({ row }) => (
        <div className='flex justify-end'>
          <PurchaseOrdersHistoryRowActions
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
