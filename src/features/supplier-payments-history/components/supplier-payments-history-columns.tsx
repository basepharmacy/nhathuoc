import { type ColumnDef } from '@tanstack/react-table'
import { LongText } from '@/components/long-text'
import { DataTableColumnHeader } from '@/components/data-table'
import { formatCurrency } from '@/lib/utils'
import { type SupplierPaymentWithSupplier } from '@/services/supabase/database/repo/supplierPaymentsRepo'
import { SupplierPaymentsHistoryRowActions } from './supplier-payments-history-row-actions'

const formatDateLabel = (value?: string | null) => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN').format(date)
}

type SupplierPaymentsHistoryColumnHandlers = {
  onPrint?: (payment: SupplierPaymentWithSupplier) => void
  onDelete: (payment: SupplierPaymentWithSupplier) => void
  hideSupplier?: boolean
}

export const getSupplierPaymentsHistoryColumns = (
  handlers: SupplierPaymentsHistoryColumnHandlers
): ColumnDef<SupplierPaymentWithSupplier>[] => {
  const columns: ColumnDef<SupplierPaymentWithSupplier>[] = [
    {
      accessorKey: 'reference_code',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Mã đơn' />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-44 ps-3'>
          {row.getValue('reference_code') || '—'}
        </LongText>
      ),
      enableHiding: false,
    },
  ]

  if (!handlers.hideSupplier) {
    columns.push({
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
    })
  }

  columns.push(
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Số tiền thanh toán' />
      ),
      cell: ({ row }) => (
        <span className='text-sm text-nowrap'>
          {formatCurrency(row.getValue('amount'))}
        </span>
      ),
      meta: { label: 'Số tiền thanh toán' },
    },
    {
      accessorKey: 'note',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Ghi chú' />
      ),
      cell: ({ row }) => (
        <LongText className='max-w-64'>
          {row.getValue('note') || '—'}
        </LongText>
      ),
      meta: { label: 'Ghi chú' },
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
      meta: { label: 'Ngày thanh toán' },
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Thao tác</div>,
      cell: ({ row }) => (
        <div className='flex justify-end'>
          <SupplierPaymentsHistoryRowActions
            row={row}
            onPrint={handlers.onPrint}
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
  )

  return columns
}
