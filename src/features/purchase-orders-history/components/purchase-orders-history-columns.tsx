import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type PurchaseOrderWithRelations } from '@/services/supabase/database/repo/purchaseOrdersRepo'
import { formatCurrency } from '@/lib/utils'
import { PurchaseOrdersHistoryRowActions } from './purchase-orders-history-row-actions'

const paymentStatusLabels: Record<PurchaseOrderWithRelations['payment_status'], string> = {
  '1_UNPAID': 'Chưa thanh toán',
  '2_PARTIALLY_PAID': 'Thanh toán một phần',
  '3_PAID': 'Đã thanh toán',
}

const paymentStatusColors: Record<PurchaseOrderWithRelations['payment_status'], string> = {
  '1_UNPAID': 'bg-amber-200/40 text-amber-900 dark:text-amber-100 border-amber-300',
  '2_PARTIALLY_PAID': 'bg-blue-100/40 text-blue-900 dark:text-blue-200 border-blue-200',
  '3_PAID': 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
}

const orderStatusLabels: Record<PurchaseOrderWithRelations['status'], string> = {
  '1_DRAFT': 'Nháp',
  '2_ORDERED': 'Đã đặt',
  '3_CHECKING': 'Đang kiểm',
  '4_STORED': 'Đã nhập kho',
  '9_CANCELLED': 'Đã hủy',
}

const orderStatusColors: Record<PurchaseOrderWithRelations['status'], string> = {
  '1_DRAFT': 'bg-neutral-200/60 text-foreground border-neutral-300',
  '2_ORDERED': 'bg-blue-100/40 text-blue-900 dark:text-blue-200 border-blue-200',
  '3_CHECKING': 'bg-amber-200/40 text-amber-900 dark:text-amber-100 border-amber-300',
  '4_STORED': 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
  '9_CANCELLED': 'bg-rose-200/40 text-rose-900 dark:text-rose-100 border-rose-300',
}

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
        <LongText className='max-w-52'>
          {row.getValue('supplier_name')}
        </LongText>
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
          <Badge variant='outline' className={cn('text-sm font-medium', paymentStatusColors[status])}>
            {paymentStatusLabels[status]}
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
          <Badge variant='outline' className={cn('text-sm font-medium', orderStatusColors[status])}>
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
