import { useCallback, useMemo, useState } from 'react'
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { purchaseOrdersRepo } from '@/client'
import { useUser } from '@/client/provider'
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
import { getPurchaseOrdersHistoryColumns } from './purchase-orders-history-columns'

type PurchaseOrdersHistoryTableProps = {
  data: PurchaseOrderWithRelations[]
}

export function PurchaseOrdersHistoryTable({ data }: PurchaseOrdersHistoryTableProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  })
  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrderWithRelations | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteTarget || !tenantId) {
        throw new Error('Thiếu thông tin đơn nhập hàng.')
      }
      await purchaseOrdersRepo.deletePurchaseOrder({
        orderId: deleteTarget.id,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-orders', tenantId] })
      setDeleteOpen(false)
      setDeleteTarget(null)
      toast.success('Đã xóa đơn nhập hàng.')
    },
    onError: (error) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Đã xảy ra lỗi, vui lòng thử lại.'
      toast.error(message)
    },
  })

  const handleEdit = useCallback(
    (order: PurchaseOrderWithRelations) => {
      navigate({
        to: '/purchase-orders',
        search: {
          orderId: order.id,
        },
      })
    },
    [navigate]
  )

  const handleDelete = useCallback((order: PurchaseOrderWithRelations) => {
    if (order.status !== '1_DRAFT') {
      toast.error('Chỉ có thể xóa đơn nháp.')
      return
    }
    setDeleteTarget(order)
    setDeleteOpen(true)
  }, [])

  const columns = useMemo(
    () => getPurchaseOrdersHistoryColumns({ onEdit: handleEdit, onDelete: handleDelete }),
    [handleEdit, handleDelete]
  )

  const supplierOptions = useMemo(() => {
    const lookup = new Map<string, string>()
    data.forEach((order) => {
      if (order.supplier?.name) {
        lookup.set(order.supplier.name, order.supplier.name)
      }
    })
    return Array.from(lookup.values()).map((name) => ({ label: name, value: name }))
  }, [data])

  const statusOptions = useMemo(
    () => [
      { label: 'Nháp', value: '1_DRAFT' },
      { label: 'Đã đặt', value: '2_ORDERED' },
      { label: 'Đang kiểm', value: '3_CHECKING' },
      { label: 'Đã nhập kho', value: '4_STORED' },
      { label: 'Đã hủy', value: '9_CANCELLED' },
    ],
    []
  )

  const paymentOptions = useMemo(
    () => [
      { label: 'Chưa thanh toán', value: '1_UNPAID' },
      { label: 'Thanh toán một phần', value: '2_PARTIALLY_PAID' },
      { label: 'Đã thanh toán', value: '3_PAID' },
    ],
    []
  )

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getPaginationRowModel: getPaginationRowModel(),
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
        searchPlaceholder='Tìm mã phiếu...'
        searchKey='purchase_order_code'
        filters={[
          {
            columnId: 'supplier_name',
            title: 'Nhà cung cấp',
            options: supplierOptions,
          },
          {
            columnId: 'payment_status',
            title: 'Thanh toán',
            options: paymentOptions,
          },
          {
            columnId: 'status',
            title: 'Trạng thái',
            options: statusOptions,
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
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-24 text-center'>
                  Không có đơn nhập hàng nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} className='mt-auto' />
      {deleteTarget && (
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={(open) => {
            setDeleteOpen(open)
            if (!open) {
              setDeleteTarget(null)
            }
          }}
          destructive
          disabled={deleteMutation.isPending}
          title='Xóa đơn nhập hàng'
          desc={
            <>
              Bạn có chắc chắn muốn xóa đơn nhập hàng{' '}
              <span className='font-bold'>{deleteTarget.purchase_order_code}</span>?
            </>
          }
          confirmText='Xóa'
          handleConfirm={() => deleteMutation.mutate()}
        />
      )}
    </div>
  )
}
