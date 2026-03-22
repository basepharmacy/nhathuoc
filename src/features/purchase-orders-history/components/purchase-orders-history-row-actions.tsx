import { type Row } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import {
  DataTableRowActions as RowActions,
  type RowAction,
} from '@/components/data-table-row-actions'
import { type PurchaseOrderWithRelations } from '@/services/supabase/database/repo/purchaseOrdersRepo'

type PurchaseOrdersHistoryRowActionsProps = {
  row: Row<PurchaseOrderWithRelations>
  onDelete: (order: PurchaseOrderWithRelations) => void
}

export function PurchaseOrdersHistoryRowActions({
  row,
  onDelete,
}: PurchaseOrdersHistoryRowActionsProps) {
  const canDelete =
    row.original.status === '1_DRAFT' || row.original.status === '2_ORDERED'

  const actions: RowAction[] = [
    {
      label: 'Xóa',
      icon: Trash2,
      destructive: true,
      disabled: !canDelete,
      tooltip: !canDelete
        ? 'Không thể xoá đơn hàng đã nhập kho.'
        : undefined,
      onClick: () => onDelete(row.original),
    },
  ]

  return <RowActions actions={actions} />
}
