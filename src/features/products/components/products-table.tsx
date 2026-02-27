import { useState } from 'react'
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableToolbar } from '@/components/data-table'
import { type Product, type ProductListFilterState } from '../data/schema'
import { productsColumns as columns } from './products-columns'

type ProductsTableProps = {
  data: Product[]
}

export function ProductsTable({ data }: ProductsTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])

  const statusFilterOptions = [
    { label: 'Nháp', value: '1_DRAFT' },
    { label: 'Đang bán', value: '2_ACTIVE' },
    { label: 'Ngưng bán', value: '3_INACTIVE' },
    { label: 'Lưu trữ', value: '4_ARCHIVED' },
  ] satisfies { label: string; value: Product['status'] }[]

  const categoryFilterOptions = Array.from(
    new Set(
      data
        .map((product) => product.categories?.name)
        .filter((categoryName): categoryName is string => Boolean(categoryName))
    )
  )
    .sort((a, b) => a.localeCompare(b, 'vi'))
    .map((categoryName) => ({
      label: categoryName,
      value: categoryName,
    }))

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  const filterState: ProductListFilterState = {
    keyword:
      (table.getColumn('product_name')?.getFilterValue() as string) ?? '',
    status: ((table.getColumn('status')?.getFilterValue() as string[]) ??
      []) as ProductListFilterState['status'],
    category: (table.getColumn('category')?.getFilterValue() as string[]) ?? [],
  }

  const hasActiveFilters =
    filterState.keyword.trim().length > 0 ||
    filterState.status.length > 0 ||
    filterState.category.length > 0

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Tìm sản phẩm...'
        searchKey='product_name'
        filters={[
          {
            columnId: 'status',
            title: 'Trạng thái',
            options: statusFilterOptions,
          },
          {
            columnId: 'category',
            title: 'Danh mục',
            options: categoryFilterOptions,
          },
        ]}
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                      header.column.columnDef.meta?.className,
                      header.column.columnDef.meta?.thClassName
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className='group/row'
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  {hasActiveFilters
                    ? 'Không tìm thấy sản phẩm phù hợp với bộ lọc.'
                    : 'Không có sản phẩm nào.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
