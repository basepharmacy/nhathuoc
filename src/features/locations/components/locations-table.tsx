import { useMemo, useState } from 'react'
import {
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { cn, includesSearchValue } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DataTableSkeletonRows, DataTableToolbar } from '@/components/data-table'
import { type Location } from '@/services/supabase'
import { getLocationsColumns } from './locations-columns'

type LocationsTableProps = {
  data: Location[]
  isLoading: boolean
}

export function LocationsTable({ data, isLoading }: LocationsTableProps) {
  const [rowSelection, setRowSelection] = useState({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([
    { id: 'status', value: ['1_ACTIVE'] },
  ])
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo(() => getLocationsColumns(), [])

  const statusOptions = useMemo(
    () => [
      { label: 'Hoạt động', value: '1_ACTIVE' },
      { label: 'Ngừng hoạt động', value: '2_INACTIVE' },
    ],
    []
  )

  const typeOptions = useMemo(
    () => [
      { label: 'Kho', value: '1_WAREHOUSE' },
      { label: 'Cửa hàng', value: '2_STORE' },
      { label: 'Khác', value: '9_OTHER' },
    ],
    []
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      globalFilter,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue ?? '')
      const nameValue = String(row.getValue('name') ?? '')
      const addressValue = String(row.getValue('address') ?? '')
      return (
        includesSearchValue(nameValue, search) ||
        includesSearchValue(addressValue, search)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Tìm tên hoặc địa chỉ cửa hàng...'
        filters={[
          {
            columnId: 'status',
            title: 'Trạng thái',
            options: statusOptions,
          },
          {
            columnId: 'type',
            title: 'Loại',
            options: typeOptions,
          },
        ]}
        hideViewOptions
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
            {isLoading ? (
              <DataTableSkeletonRows table={table} />
            ) : table.getRowModel().rows?.length ? (
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  Không có cửa hàng nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
