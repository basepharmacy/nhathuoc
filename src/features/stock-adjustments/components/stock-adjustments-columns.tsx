import { useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { MoreHorizontalIcon } from 'lucide-react'
import { formatCurrency, formatDateTimeLabel, formatQuantity } from '@/lib/utils'
import { type StockAdjustmentWithRelations } from '@/services/supabase/database/repo/stockAdjustmentsRepo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { getReasonCodeLabel } from '../data/reason-code'

function CancelAdjustmentCell({
  row,
  onCancel,
}: {
  row: StockAdjustmentWithRelations
  onCancel: (row: StockAdjustmentWithRelations) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <MoreHorizontalIcon className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onSelect={() => setOpen(true)}>
            Huỷ điều chỉnh
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Huỷ đơn điều chỉnh</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn huỷ đơn điều chỉnh này không? Các điều chỉnh tồn kho thay đổi sẽ được cập nhật lại như cũ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Đóng</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onCancel(row)}
            >
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export function createStockAdjustmentsColumns(
  onCancel: (row: StockAdjustmentWithRelations) => void
): ColumnDef<StockAdjustmentWithRelations>[] {
  return [
    {
      id: 'search',
      accessorFn: (row) => `${row.batch_code} ${row.products?.product_name ?? ''}`,
      header: () => null,
      cell: () => null,
      enableHiding: true,
    },
    {
      id: 'location_id',
      accessorFn: (row) => row.location_id ?? '',
      header: () => null,
      cell: () => null,
      enableHiding: true,
    },
    {
      id: 'adjustment_type',
      accessorFn: (row) => (row.quantity > 0 ? 'increase' : 'decrease'),
      header: () => null,
      cell: () => null,
      enableHiding: true,
    },
    {
      id: 'product_name',
      header: 'Sản phẩm',
      cell: ({ row }) => (
        <span className='font-medium'>
          {row.original.products?.product_name ?? 'Không rõ'}
        </span>
      ),
    },
    {
      accessorKey: 'batch_code',
      header: 'Mã lô',
    },
    {
      accessorKey: 'quantity',
      header: 'Số lượng',
      cell: ({ row }) => {
        const qty = row.original.quantity
        return (
          <Badge variant={qty >= 0 ? 'default' : 'destructive'} className='tabular-nums'>
            {qty >= 0 ? '+' : ''}{formatQuantity(qty)}
          </Badge>
        )
      },
      meta: { className: 'text-center', thClassName: 'text-center' },
    },
    {
      accessorKey: 'cost_price',
      header: 'Giá nhập',
      cell: ({ row }) => (
        <span className='tabular-nums'>
          {formatCurrency(row.original.cost_price)}đ
        </span>
      ),
      meta: { className: 'text-end', thClassName: 'text-end' },
    },
    {
      accessorKey: 'reason_code',
      header: 'Lý do',
      cell: ({ row }) => getReasonCodeLabel(row.original.reason_code),
    },
    {
      accessorKey: 'reason',
      header: 'Ghi chú',
      cell: ({ row }) => (
        <span className='max-w-48 truncate'>
          {row.original.reason ?? '-'}
        </span>
      ),
    },
    {
      id: 'location_name',
      header: 'Cửa hàng',
      cell: ({ row }) => row.original.locations?.name ?? '-',
    },
    {
      accessorKey: 'created_at',
      header: 'Ngày tạo',
      cell: ({ row }) => formatDateTimeLabel(row.original.created_at),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <CancelAdjustmentCell row={row.original} onCancel={onCancel} />
      ),
      meta: { className: 'w-10' },
    },
  ]
}
