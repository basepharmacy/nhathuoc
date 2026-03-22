import { type ColumnDef } from '@tanstack/react-table'
import { cn, includesSearchValue } from '@/lib/utils'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/ui/long-text'
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
    accessorKey: 'active_products_count',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='SP đang bán' />
    ),
    cell: ({ row }) => (
      <span className='text-sm'>
        {Number(row.getValue('active_products_count') ?? 0)}
      </span>
    ),
    meta: { label: 'SP đang bán' },
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
    header: () => <div className='text-right'>Thao tác</div>,
    cell: ({ row }) => (
      <div className='flex justify-end'>
        <DataTableRowActions row={row} />
      </div>
    ),
    meta: {
      className: 'sticky right-0 bg-background shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]',
      thClassName: 'sticky right-0 bg-background shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]',
    },
  },
]
