import { type Row } from '@tanstack/react-table'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import {
  DataTableRowActions as RowActions,
  type RowAction,
} from '@/components/data-table-row-actions'
import { type PurchaseOrderWithRelations } from '@/services/supabase/database/repo/purchaseOrdersRepo'

type PurchaseOrdersHistoryRowActionsProps = {
  row: Row<PurchaseOrderWithRelations>
  onEdit: (order: PurchaseOrderWithRelations) => void
  onDelete: (order: PurchaseOrderWithRelations) => void
}

export function PurchaseOrdersHistoryRowActions({
  row,
  onEdit,
  onDelete,
}: PurchaseOrdersHistoryRowActionsProps) {
  const isDraft = row.original.status === '1_DRAFT'
  const canDelete =
    row.original.status === '1_DRAFT' || row.original.status === '2_ORDERED'

  const actions: RowAction[] = [
    {
      label: isDraft ? 'Chỉnh sửa' : 'Xem chi tiết',
      icon: isDraft ? Pencil : Eye,
      onClick: () => onEdit(row.original),
    },
    {
      label: 'Xóa',
      icon: Trash2,
      destructive: true,
      disabled: !canDelete,
      tooltip:
        'Không thể xoá đơn hàng đã nhập kho. Hãy dùng tính năng điều chỉnh tồn kho để điều chỉnh lại tồn kho nếu cần',
      onClick: () => onDelete(row.original),
    },
  ]

  return <RowActions actions={actions} />
}
