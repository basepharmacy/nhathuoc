import { type ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Product } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

const productStatusLabelMap: Record<Product['status'], string> = {
  '1_DRAFT': 'Nháp',
  '2_ACTIVE': 'Đang bán',
  '3_INACTIVE': 'Ngưng bán',
  '4_ARCHIVED': 'Lưu trữ',
}

export const productsColumns: ColumnDef<Product>[] = [
  {
    accessorKey: 'product_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tên sản phẩm' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-64'>{row.getValue('product_name')}</LongText>
    ),
    enableHiding: false,
  },
  {
    accessorKey: 'jan_code',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Mã JAN' />
    ),
    cell: ({ row }) => {
      const janCode = row.getValue('jan_code') as string | null
      return <LongText className='max-w-40'>{janCode ?? '—'}</LongText>
    },
    enableSorting: false,
  },
  {
    id: 'category',
    accessorFn: (row) => row.categories?.name ?? '',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Danh mục' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-48'>
        {row.original.categories?.name ?? '—'}
      </LongText>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Trạng thái' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as Product['status']
      return <Badge variant='outline'>{productStatusLabelMap[status]}</Badge>
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'min_stock',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ngưỡng tồn kho' />
    ),
    cell: ({ row }) => {
      const minStock = row.getValue('min_stock') as number | null
      return <span>{minStock ?? '—'}</span>
    },
  },
  {
    id: 'units_summary',
    accessorFn: (row) =>
      row.product_units.map((unit) => unit.unit_name).join(', '),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Đơn vị' />
    ),
    cell: ({ row }) => {
      const units = row.original.product_units
      if (units.length === 0) return <span>—</span>
      return (
        <LongText className='max-w-56'>
          {units.map((unit) => unit.unit_name).join(', ')}
        </LongText>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Ngày tạo' />
    ),
    cell: ({ row }) => {
      const date = row.getValue('created_at') as string | null
      if (!date) return <span>—</span>
      return (
        <span className='text-sm text-nowrap'>
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
