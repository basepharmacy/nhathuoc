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
import { DataTablePagination, DataTableToolbar } from '@/components/data-table'
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
  deleteState,
}: PurchaseOrdersHistoryTableProps) {
  const searchPlaceholder = 'Tìm mã phiếu...'

  return (
    <div className='flex flex-1 flex-col gap-4'>
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        searchKey={searchKey}
        filters={filters}
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
              <TableRow>
                <TableCell
                  colSpan={table.getAllLeafColumns().length}
                  className='h-24 text-center'
                >
                  Đang tải...
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
