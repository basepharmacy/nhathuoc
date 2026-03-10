import { type ColumnDef } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { LongText } from '@/components/long-text'
import { DataTableColumnHeader } from '@/components/data-table'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { type SupplierPayment } from '@/services/supabase/database/repo/supplierPaymentsRepo'

const formatDateLabel = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN').format(date)
}

export const getSupplierPaymentsColumns = ({
  onDelete,
}: {
  onDelete?: (payment: SupplierPayment) => void
}): ColumnDef<SupplierPayment>[] => [
  {
    accessorKey: 'reference_code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Mã thanh toán' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-40 ps-3'>{row.getValue('reference_code') || '—'}</LongText>
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
  ...(onDelete
    ? [
        {
          id: 'actions',
          cell: ({ row }: { row: { original: SupplierPayment } }) => (
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 text-red-500 hover:text-red-600'
              onClick={() => onDelete(row.original)}
            >
              <Trash2 size={16} />
              <span className='sr-only'>Xóa</span>
            </Button>
          ),
          enableSorting: false,
        } as ColumnDef<SupplierPayment>,
      ]
    : []),
]
