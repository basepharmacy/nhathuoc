import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Supplier } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const suppliersColumns: ColumnDef<Supplier>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tên nhà cung cấp' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48 ps-3'>{row.getValue('name')}</LongText>
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
    accessorKey: 'phone',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Số điện thoại' />
    ),
    cell: ({ row }) => {
      const phone = row.getValue('phone') as string | null
      return <span className='text-sm'>{phone ?? '—'}</span>
    },
    meta: { label: 'Số điện thoại' },
    enableSorting: false,
  },
  {
    accessorKey: 'representative',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Người đại diện' />
    ),
    cell: ({ row }) => {
      const representative = row.getValue('representative') as string | null
      return <LongText className='max-w-48'>{representative ?? '—'}</LongText>
    },
    meta: { label: 'Người đại diện' },
    enableSorting: false,
  },
  {
    accessorKey: 'address',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Địa chỉ' />
    ),
    cell: ({ row }) => {
      const address = row.getValue('address') as string | null
      return <LongText className='max-w-64'>{address ?? '—'}</LongText>
    },
    meta: { label: 'Địa chỉ' },
    enableSorting: false,
  },
  {
    accessorKey: 'is_active',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Trạng thái' />
    ),
    cell: ({ row }) => {
      const isActive = row.getValue('is_active') as boolean | null
      if (isActive === null) return <span>—</span>
      return (
        <Badge variant={isActive ? 'secondary' : 'outline'}>
          {isActive ? 'Đang giao dịch' : 'Ngừng giao dịch'}
        </Badge>
      )
    },
    meta: { label: 'Trạng thái' },
    filterFn: (row, id, value) => {
      return value.includes(String(row.getValue(id)))
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ngày tạo' />
    ),
    meta: { label: 'Ngày tạo' },
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string | null
      if (!date) return <span>—</span>
      return (
        <span className='text-nowrap text-sm'>
          {new Date(date).toLocaleDateString('vi-VN')}
        </span>
      )
    },
  },
  {
    id: 'actions',
    cell: DataTableRowActions,
  },
]
