import { useEffect, useMemo, useState } from 'react'
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
import { useLocationContext } from '@/context/location-provider'
import { type Location } from '@/services/supabase'
import { roles } from '../data/staff-data'
import { type StaffUser } from '../data/staff-schema'
import { staffColumns as columns } from './staff-columns'

type DataTableProps = {
  data: StaffUser[]
  locations?: Location[]
  isLoading?: boolean
  isError?: boolean
}

export function StaffTable({
  data,
  locations = [],
  isLoading,
  isError,
}: DataTableProps) {
  const { selectedLocationId } = useLocationContext()

  // Local UI-only states
  const [rowSelection, setRowSelection] = useState({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() =>
    selectedLocationId
      ? [{ id: 'location', value: [selectedLocationId] }]
      : []
  )

  useEffect(() => {
    if (!selectedLocationId) {
      setColumnFilters((prev) => prev.filter((filter) => filter.id !== 'location'))
      return
    }
    setColumnFilters((prev) => {
      const withoutLocation = prev.filter((filter) => filter.id !== 'location')
      return [...withoutLocation, { id: 'location', value: [selectedLocationId] }]
    })
  }, [selectedLocationId])

  const locationOptions = useMemo(
    () => [
      ...locations.map((location) => ({
        label: location.name,
        value: location.id,
      })),
    ],
    [locations]
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16', // Add margin bottom to the table on mobile when the toolbar is visible
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder='Tìm nhân viên...'
        searchKey='name'
        filters={[
          {
            columnId: 'role',
            title: 'Vai trò',
            options: roles.map((role) => ({ ...role })),
          },
          {
            columnId: 'location',
            title: 'Cửa hàng',
            options: locationOptions,
          },
        ]}
        hideViewOptions
      />
      <div className='overflow-hidden rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className='group/row'>
                {headerGroup.headers.map((header) => {
                  return (
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
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  Không thể tải danh sách nhân viên.
                </TableCell>
              </TableRow>
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
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
