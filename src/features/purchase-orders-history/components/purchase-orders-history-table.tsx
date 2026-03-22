import { useEffect, useState } from 'react'
import { type Table as ReactTable, flexRender } from '@tanstack/react-table'
import { Cross2Icon } from '@radix-ui/react-icons'
import { cn } from '@/lib/utils'
import { ConfirmDialog } from '@/components/confirm-dialog'
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
import { DataTablePagination, DataTableSkeletonRows, DataTableFacetedFilter } from '@/components/data-table'
import { DatePicker } from '@/components/date-picker'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { type PurchaseOrderWithRelations } from '@/services/supabase/database/repo/purchaseOrdersRepo'

type PurchaseOrdersHistoryTableProps = {
  table: ReactTable<PurchaseOrderWithRelations>
  isLoading: boolean
  searchKey: string
  filters: {
    columnId: string
    title: string
    options: { label: string; value: string }[]
  }[]
  fromDate?: Date | undefined
  toDate?: Date | undefined
  onFromDateChange?: (date: Date | undefined) => void
  onToDateChange?: (date: Date | undefined) => void
  onRowClick?: (row: PurchaseOrderWithRelations) => void
  deleteState?: {
    target: PurchaseOrderWithRelations | null
    open: boolean
    onOpenChange: (open: boolean) => void
    disabled?: boolean
    onConfirm: () => void
  } | null
}

export function PurchaseOrdersHistoryTable({
  table,
  isLoading,
  searchKey,
  filters,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onRowClick,
  deleteState,
}: PurchaseOrdersHistoryTableProps) {
  const filterValue = (table.getColumn(searchKey)?.getFilterValue() as string) ?? ''
  const [localValue, setLocalValue] = useState(filterValue)
  const debouncedValue = useDebouncedValue(localValue, 300)

  useEffect(() => {
    table.getColumn(searchKey)?.setFilterValue(debouncedValue)
  }, [debouncedValue, table, searchKey])

  useEffect(() => {
    setLocalValue(filterValue)
  }, [filterValue])

  const hasDateFilter = onFromDateChange && onToDateChange

  const isFiltered =
    localValue.length > 0 ||
    table.getState().columnFilters.length > 0 ||
    fromDate !== undefined ||
    toDate !== undefined

  const handleReset = () => {
    setLocalValue('')
    table.resetColumnFilters()
    table.setGlobalFilter('')
    onFromDateChange?.(undefined)
    onToDateChange?.(undefined)
  }

  return (
    <div className='flex flex-1 flex-col gap-4'>
      {/* Toolbar */}
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 flex-col-reverse items-start gap-y-2 sm:flex-row sm:items-center sm:space-x-2'>
          <Input
            placeholder='Tìm mã phiếu...'
            value={localValue}
            onChange={(event) => setLocalValue(event.target.value)}
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
            <Button
              variant='ghost'
              onClick={handleReset}
              className='h-8 px-2 lg:px-3'
            >
              Reset
              <Cross2Icon className='ms-2 h-4 w-4' />
            </Button>
          )}
        </div>
        {hasDateFilter && (
          <div className='flex items-center gap-x-2'>
            <DatePicker
              selected={fromDate}
              onSelect={onFromDateChange}
              placeholder='Từ ngày'
              disablePastDates={false}
              className='h-8 w-[140px] justify-start text-start text-sm font-normal data-[empty=true]:text-muted-foreground'
            />
            <span className='text-sm text-muted-foreground'>-</span>
            <DatePicker
              selected={toDate}
              onSelect={onToDateChange}
              placeholder='Đến ngày'
              disablePastDates={false}
              className='h-8 w-[140px] justify-start text-start text-sm font-normal data-[empty=true]:text-muted-foreground'
            />
          </div>
        )}
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
                  className={cn('group/row', onRowClick && 'cursor-pointer')}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                      onClick={
                        cell.column.id === 'actions'
                          ? (e) => e.stopPropagation()
                          : undefined
                      }
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
                  Không có đơn nhập hàng nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      {deleteState?.target && (
        <ConfirmDialog
          open={deleteState.open}
          onOpenChange={deleteState.onOpenChange}
          destructive
          disabled={deleteState.disabled}
          title='Xóa đơn nhập hàng'
          desc={
            <>
              Bạn có chắc chắn muốn xóa đơn nhập hàng{' '}
              <span className='font-bold'>
                {deleteState.target.purchase_order_code}
              </span>
              ?
            </>
          }
          confirmText='Xóa'
          handleConfirm={deleteState.onConfirm}
        />
      )}
    </div>
  )
}
