import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type VisibilityState,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from '@tanstack/react-table'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Cross2Icon } from '@radix-ui/react-icons'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { stockAdjustmentsRepo } from '@/client'
import { useUser } from '@/client/provider'
import { mapSupabaseError } from '@/lib/error-mapper'
import { type StockAdjustmentWithRelations } from '@/services/supabase/database/repo/stockAdjustmentsRepo'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/date-picker'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { DataTablePagination, DataTableSkeletonRows, DataTableFacetedFilter } from '@/components/data-table'
import { createStockAdjustmentsColumns } from './stock-adjustments-columns'

type FilterOption = {
  columnId: string
  title: string
  options: { label: string; value: string }[]
}

type Props = {
  data: StockAdjustmentWithRelations[]
  tableState: {
    pagination: PaginationState
    columnFilters: ColumnFiltersState
    columnVisibility: VisibilityState
    onPaginationChange: OnChangeFn<PaginationState>
    onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
    onColumnVisibilityChange: OnChangeFn<VisibilityState>
  }
  pageCount: number
  total: number
  isLoading: boolean
  filters: FilterOption[]
  fromDate?: Date | undefined
  toDate?: Date | undefined
  onFromDateChange?: (date: Date | undefined) => void
  onToDateChange?: (date: Date | undefined) => void
}

export function StockAdjustmentsTable({
  data,
  tableState,
  pageCount,
  total,
  isLoading,
  filters,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}: Props) {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()

  const cancelMutation = useMutation({
    mutationFn: async (row: StockAdjustmentWithRelations) => {
      await stockAdjustmentsRepo.deleteStockAdjustment(row.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments', tenantId] })
      queryClient.invalidateQueries({ queryKey: ['inventory-batches', tenantId, 'all', 'all-available'] })
      toast.success('Đã huỷ đơn điều chỉnh thành công.')
    },
    onError: (error) => {
      toast.error(mapSupabaseError(error))
    },
  })

  const handleCancel = useCallback(
    (row: StockAdjustmentWithRelations) => cancelMutation.mutate(row),
    [cancelMutation]
  )

  const columns = useMemo(
    () => createStockAdjustmentsColumns({ onCancel: handleCancel }),
    [handleCancel]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      pagination: tableState.pagination,
      columnFilters: tableState.columnFilters,
      columnVisibility: tableState.columnVisibility,
    },
    onPaginationChange: tableState.onPaginationChange,
    onColumnFiltersChange: tableState.onColumnFiltersChange,
    onColumnVisibilityChange: tableState.onColumnVisibilityChange,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualPagination: true,
    pageCount,
    rowCount: total,
  })

  const filterValue = (table.getColumn('search')?.getFilterValue() as string) ?? ''
  const [localValue, setLocalValue] = useState(filterValue)
  const debouncedValue = useDebouncedValue(localValue, 300)

  useEffect(() => {
    table.getColumn('search')?.setFilterValue(debouncedValue)
  }, [debouncedValue, table])

  useEffect(() => {
    setLocalValue(filterValue)
  }, [filterValue])

  const isFiltered =
    localValue.length > 0 ||
    table.getState().columnFilters.length > 0 ||
    fromDate !== undefined ||
    toDate !== undefined

  const handleReset = () => {
    setLocalValue('')
    table.resetColumnFilters()
    onFromDateChange?.(undefined)
    onToDateChange?.(undefined)
  }

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
          <Input
            placeholder='Tìm sản phẩm...'
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            className='h-8 w-[150px] lg:w-[250px]'
          />
          <div className='flex gap-x-2'>
            {filters.map((filter) => {
              const column = table.getColumn(filter.columnId)
              if (!column) return null
              return (
                <DataTableFacetedFilter
                  key={filter.columnId}
                  column={column}
                  title={filter.title}
                  options={filter.options}
                />
              )
            })}
          </div>
          {isFiltered && (
            <Button variant='ghost' onClick={handleReset} className='h-8 px-2 lg:px-3'>
              Reset
              <Cross2Icon className='ms-2 h-4 w-4' />
            </Button>
          )}
        </div>
        <div className='flex items-center gap-x-2'>
          <DatePicker
            selected={fromDate}
            onSelect={(d) => onFromDateChange?.(d)}
            placeholder='Từ ngày'
            disablePastDates={false}
            className='h-8 w-[140px] justify-start text-start text-sm font-normal data-[empty=true]:text-muted-foreground'
          />
          <span className='text-sm text-muted-foreground'>-</span>
          <DatePicker
            selected={toDate}
            onSelect={(d) => onToDateChange?.(d)}
            placeholder='Đến ngày'
            disablePastDates={false}
            className='h-8 w-[140px] justify-start text-start text-sm font-normal data-[empty=true]:text-muted-foreground'
          />
        </div>
      </div>
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
                <TableCell
                  colSpan={table.getAllLeafColumns().length}
                  className='h-24 text-center'
                >
                  Chưa có dữ liệu điều chỉnh tồn kho.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
    </div>
  )
}
