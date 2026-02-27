import { type ColumnDef } from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import { type Product } from '../data/schema'
import { DataTableRowActions } from './data-table-row-actions'

const productTypeLabels: Record<Product['product_type'], string> = {
  '1_OTC': 'OTC',
  '2_PRESCRIPTION_REQUIRED': 'Cần đơn',
}

const productStatusLabels: Record<Product['status'], string> = {
  '1_DRAFT': 'Nháp',
  '2_ACTIVE': 'Đang bán',
  '3_INACTIVE': 'Ngừng bán',
  '4_ARCHIVED': 'Lưu trữ',
}

type CategoryLookup = Record<string, string>

export const getProductsColumns = (
  categoryLookup: CategoryLookup
): ColumnDef<Product>[] => [
  {
    accessorKey: 'product_name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tên sản phẩm' />
    ),
    cell: ({ row }) => (
      <LongText className='max-w-56 ps-3'>
        {row.getValue('product_name')}
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
    accessorKey: 'product_type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Loại' />
    ),
    cell: ({ row }) => {
      const type = row.getValue('product_type') as Product['product_type']
      return <span className='text-sm'>{productTypeLabels[type]}</span>
    },
    meta: { label: 'Loại' },
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Trạng thái' />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as Product['status']
      return <span className='text-sm'>{productStatusLabels[status]}</span>
    },
    meta: { label: 'Trạng thái' },
    enableSorting: false,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'category_id',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Danh mục' />
    ),
    cell: ({ row }) => {
      const categoryId = row.getValue('category_id') as string | null
      if (!categoryId) return <span className='text-sm'>—</span>
      return (
        <span className='text-sm'>
          {categoryLookup[categoryId] ?? '—'}
        </span>
      )
    },
    meta: { label: 'Danh mục' },
    enableSorting: false,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: 'min_stock',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Tồn tối thiểu' />
    ),
    cell: ({ row }) => {
      const minStock = row.getValue('min_stock') as number | null
      return <span className='text-sm'>{minStock ?? '—'}</span>
    },
    meta: { label: 'Tồn tối thiểu' },
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
