import { useCallback, useMemo } from 'react'
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
import { DatePicker } from '@/components/date-picker'
import { DataTablePagination, DataTableSkeletonRows, DataTableToolbar } from '@/components/data-table'
import { createStockAdjustmentsColumns } from './stock-adjustments-columns'

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
  filters: {
    columnId: string
    title: string
    singleSelect?: boolean
    options: { label: string; value: string }[]
  }[]
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

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Tìm sản phẩm...'
        searchKey='search'
        filters={filters}
        hideViewOptions
        extraIsFiltered={fromDate !== undefined || toDate !== undefined}
        onReset={() => {
          onFromDateChange?.(undefined)
          onToDateChange?.(undefined)
        }}
        rightContent={
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
        }
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
