import { useState } from 'react'
import { type Row } from '@tanstack/react-table'
import { Ban } from 'lucide-react'
import {
  DataTableRowActions as RowActions,
  type RowAction,
} from '@/components/data-table-row-actions'
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
import { type StockAdjustmentWithRelations } from '@/services/supabase/'

type StockAdjustmentsRowActionsProps = {
  row: Row<StockAdjustmentWithRelations>
  onCancel?: (adjustment: StockAdjustmentWithRelations) => void
}

export function StockAdjustmentsRowActions({
  row,
  onCancel,
}: StockAdjustmentsRowActionsProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const actions: RowAction[] = [
    ...(onCancel
      ? [
        {
          label: 'Huỷ điều chỉnh',
          icon: Ban,
          onClick: () => setShowConfirm(true),
        },
      ]
      : []),
  ]

  if (actions.length === 0) return null

  return (
    <>
      <RowActions actions={actions} />

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Huỷ đơn điều chỉnh</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn huỷ đơn điều chỉnh này không? Các điều
              chỉnh tồn kho thay đổi sẽ được cập nhật lại như cũ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Đóng</AlertDialogCancel>
            <AlertDialogAction onClick={() => onCancel?.(row.original)}>
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
