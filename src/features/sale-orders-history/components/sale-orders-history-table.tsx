import { type Table as ReactTable, flexRender } from '@tanstack/react-table'
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
import { DatePicker } from '@/components/date-picker'
import { DataTablePagination, DataTableSkeletonRows, DataTableToolbar } from '@/components/data-table'
import { type SaleOrderWithRelations } from '@/services/supabase/'

type SaleOrdersHistoryTableProps = {
  table: ReactTable<SaleOrderWithRelations>
  isLoading: boolean
  searchKey: string
  filters: {
    columnId: string
    title: string
    options: { label: string; value: string }[]
    singleSelect?: boolean
  }[]
  fromDate?: Date | undefined
  toDate?: Date | undefined
  onFromDateChange?: (date: Date | undefined) => void
  onToDateChange?: (date: Date | undefined) => void
  onRowClick?: (row: SaleOrderWithRelations) => void
  deleteState?: {
    target: SaleOrderWithRelations | null
    open: boolean
    onOpenChange: (open: boolean) => void
    disabled?: boolean
    onConfirm: () => void
  } | null
}

export function SaleOrdersHistoryTable({
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
}: SaleOrdersHistoryTableProps) {
  const hasDateFilter = onFromDateChange && onToDateChange

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder='Tìm mã đơn...'
        searchKey={searchKey}
        filters={filters}
        hideViewOptions
        extraIsFiltered={fromDate !== undefined || toDate !== undefined}
        onReset={() => {
          onFromDateChange?.(undefined)
          onToDateChange?.(undefined)
        }}
        rightContent={
          hasDateFilter && (
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
          )
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
                  Không có đơn bán hàng nào.
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
          title='Xóa đơn bán hàng'
          desc={
            <>
              Bạn có chắc chắn muốn xóa đơn bán hàng{' '}
              <span className='font-bold'>
                {deleteState.target.sale_order_code}
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
