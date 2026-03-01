import { type ColumnDef } from '@tanstack/react-table'
import { cn, includesSearchValue } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { DataTableColumnHeader } from '@/components/data-table'
import { LongText } from '@/components/long-text'
import {
  type Product,
  productStatusLabels,
} from '../data/schema'
import {
  type ProductUnit,
  type ProductWithUnits,
} from '@/services/supabase/database/repo/productsRepo'
import { DataTableRowActions } from './data-table-row-actions'

const productStatusColors: Record<Product['status'], string> = {
  '1_DRAFT': 'bg-neutral-300/40 border-neutral-300 text-foreground',
  '2_ACTIVE': 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
  '3_INACTIVE': 'bg-amber-200/40 text-amber-900 dark:text-amber-100 border-amber-300',
}

type CategoryLookup = Record<string, string>

const getBaseUnit = (product: ProductWithUnits) =>
  product.product_units?.find((unit) => unit.is_base_unit) ??
  product.product_units?.[0]

const formatPrice = (value: ProductUnit['cost_price'] | null | undefined) =>
  value === null || value === undefined
    ? '—'
    : new Intl.NumberFormat('vi-VN').format(value)

export const getProductsColumns = (
  categoryLookup: CategoryLookup
): ColumnDef<ProductWithUnits>[] => [
    {
      accessorKey: 'jan_code',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Mã sản phẩm' />
      ),
      cell: ({ row }) => {
        const code = row.getValue('jan_code') as string | null
        return <span className='text-sm'>{code ?? '—'}</span>
      },
      meta: { label: 'Mã sản phẩm' },
      enableSorting: false,
      filterFn: (row, id, value) =>
        includesSearchValue(String(row.getValue(id) ?? ''), String(value ?? '')),
    },
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
      filterFn: (row, id, value) =>
        includesSearchValue(String(row.getValue(id) ?? ''), String(value ?? '')),
      enableHiding: false,
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
      id: 'base_unit_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Đơn vị' />
      ),
      cell: ({ row }) => {
        const baseUnit = getBaseUnit(row.original)
        return <span className='text-sm'>{baseUnit?.unit_name ?? '—'}</span>
      },
      meta: { label: 'Đơn vị' },
      enableSorting: false,
    },
    {
      id: 'base_cost_price',
      accessorFn: (row) => getBaseUnit(row)?.cost_price ?? null,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Giá nhập' />
      ),
      cell: ({ row }) => {
        const baseUnit = getBaseUnit(row.original)
        return (
          <span className='text-nowrap text-sm'>
            {formatPrice(baseUnit?.cost_price)}
          </span>
        )
      },
      meta: { label: 'Giá nhập' },
      sortingFn: (rowA, rowB, columnId) => {
        const left = rowA.getValue(columnId) as number | null
        const right = rowB.getValue(columnId) as number | null
        if (left === null && right === null) return 0
        if (left === null) return 1
        if (right === null) return -1
        return left - right
      },
    },
    {
      id: 'base_sell_price',
      accessorFn: (row) => getBaseUnit(row)?.sell_price ?? null,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Giá bán' />
      ),
      cell: ({ row }) => {
        const baseUnit = getBaseUnit(row.original)
        return (
          <span className='text-nowrap text-sm'>
            {formatPrice(baseUnit?.sell_price)}
          </span>
        )
      },
      meta: { label: 'Giá bán' },
      sortingFn: (rowA, rowB, columnId) => {
        const left = rowA.getValue(columnId) as number | null
        const right = rowB.getValue(columnId) as number | null
        if (left === null && right === null) return 0
        if (left === null) return 1
        if (right === null) return -1
        return left - right
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
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Trạng thái' />
      ),
      cell: ({ row }) => {
        const status = row.getValue('status') as Product['status']
        return (
          <div className='flex space-x-2'>
            <Badge
              variant='outline'
              className={cn('text-sm font-medium', productStatusColors[status])}
            >
              {productStatusLabels[status]}
            </Badge>
          </div>
        )
      },
      meta: { label: 'Trạng thái' },
      enableSorting: false,
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
    },
    {
      id: 'actions',
      cell: DataTableRowActions,
    },
  ]
