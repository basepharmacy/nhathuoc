import { type ColumnDef } from '@tanstack/react-table'
import { LongText } from '@/components/long-text'
import { DataTableColumnHeader } from '@/components/data-table'
import { formatCurrency } from '@/features/purchase-orders/data/utils'
import { type SupplierPayment } from '@/services/supabase/database/repo/supplierPaymentsRepo'

const formatDateLabel = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN').format(date)
}

export const supplierPaymentsColumns: ColumnDef<SupplierPayment>[] = [
  {
    id: 'reference_code',
    accessorFn: (row) => row.reference_code ?? row.id,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Mã thanh toán' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-40 ps-3'>{row.getValue('reference_code')}</LongText>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số tiền thanh toán' />
    ),
    cell: ({ row }) => (
      <span className='text-sm text-nowrap'>
        {formatCurrency(row.getValue('amount'))}đ
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'note',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ghi chú' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-64'>{row.getValue('note') || '—'}</LongText>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'payment_date',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ngày thanh toán' />
    ),
    cell: ({ row }) => (
      <span className='text-sm'>
        {formatDateLabel(row.getValue('payment_date'))}
      </span>
    ),
    enableSorting: false,
  },
]
