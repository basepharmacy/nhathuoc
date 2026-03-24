import { useEffect, useMemo, useState } from 'react'
import {
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { type UseMutationResult, useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { DataTablePagination, DataTableSkeletonRows, DataTableBulkActions } from '@/components/data-table'
import { useUser } from '@/client/provider'
import { getProductsQueryOptions } from '@/client/queries'
import type { ProductMasterWithUnits } from '@/services/supabase/database/repo/productMastersRepo'
import { productMastersColumns } from './product-masters-columns'
import { ProductMasterDetailDialog } from './product-master-detail-dialog'

type ProductMastersTableProps = {
  data: ProductMasterWithUnits[]
  total: number
  isLoading: boolean
  pagination: PaginationState
  onPaginationChange: React.Dispatch<React.SetStateAction<PaginationState>>
  addMutation: UseMutationResult<void, Error, ProductMasterWithUnits[]>
}

export function ProductMastersTable({
  data,
  total,
  isLoading,
  pagination,
  onPaginationChange,
  addMutation,
}: ProductMastersTableProps) {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''

  const { data: existingProducts = [] } = useQuery({
    ...getProductsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const addedRegisNumbers = useMemo(() => {
    const set = new Set<string>()
    for (const p of existingProducts) {
      if (p.regis_number) set.add(p.regis_number)
    }
    return set
  }, [existingProducts])

  const [rowSelection, setRowSelection] = useState({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [detailMaster, setDetailMaster] = useState<ProductMasterWithUnits | null>(null)

  // Reset selection when data changes (search or page change)
  useEffect(() => {
    setRowSelection({})
  }, [data])
  const [sorting, setSorting] = useState<SortingState>([])

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: productMastersColumns,
    state: {
      sorting,
      columnFilters,
      rowSelection,
      pagination,
    },
    enableRowSelection: (row) => {
      const regis = row.original.regis_number
      return !regis || !addedRegisNumbers.has(regis)
    },
    meta: { addedRegisNumbers },
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange,
    manualPagination: true,
    pageCount: Math.ceil(total / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const handleAddSelected = () => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    if (selectedRows.length === 0) return
    const masters = selectedRows.map((row) => row.original)
    addMutation.mutate(masters, {
      onSuccess: (_data, variables) => {
        table.resetRowSelection()
        toast.success(`Đã thêm ${variables.length} sản phẩm thành công`)
      },
    })
  }

  return (
    <div className='flex flex-1 flex-col gap-4'>
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
                  className='group/row cursor-pointer'
                  onClick={() => setDetailMaster(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'bg-background group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted',
                        cell.column.columnDef.meta?.className,
                        cell.column.columnDef.meta?.tdClassName
                      )}
                      onClick={cell.column.id === 'select' ? (e) => e.stopPropagation() : undefined}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={productMastersColumns.length} className='h-24 text-center'>
                  Không tìm thấy sản phẩm nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} totalRows={total} totalLabel='sản phẩm' />

      <DataTableBulkActions table={table} entityName='sản phẩm'>
        <Button
          size='sm'
          onClick={handleAddSelected}
          disabled={addMutation.isPending}
        >
          <Plus className='mr-1 h-4 w-4' />
          {addMutation.isPending ? 'Đang thêm...' : 'Thêm vào sản phẩm'}
        </Button>
      </DataTableBulkActions>

      <ProductMasterDetailDialog
        master={detailMaster}
        open={!!detailMaster}
        onOpenChange={(open) => {
          if (!open) setDetailMaster(null)
        }}
        isAdded={!!detailMaster?.regis_number && addedRegisNumbers.has(detailMaster.regis_number)}
        addMutation={addMutation}
      />
    </div>
  )
}
