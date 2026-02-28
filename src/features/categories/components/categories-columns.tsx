import { type ColumnDef } from '@tanstack/react-table'
import { cn, includesSearchValue } from '@/lib/utils'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Category } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

export const categoriesColumns: ColumnDef<Category>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tên danh mục' />
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
    filterFn: (row, id, value) =>
      includesSearchValue(String(row.getValue(id) ?? ''), String(value ?? '')),
    enableHiding: false,
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Mô tả' />
    ),
    cell: ({ row }) => {
      const description = row.getValue('description') as string | null
      return <LongText className='max-w-64'>{description ?? '—'}</LongText>
    },
    meta: { label: 'Mô tả' },
    enableSorting: false,
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
