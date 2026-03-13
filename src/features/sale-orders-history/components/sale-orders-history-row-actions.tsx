import { type Row } from '@tanstack/react-table'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import {
  DataTableRowActions as RowActions,
  type RowAction,
} from '@/components/data-table-row-actions'
import { type SaleOrderWithRelations } from '@/services/supabase/'

type SaleOrdersHistoryRowActionsProps = {
  row: Row<SaleOrderWithRelations>
  onEdit: (order: SaleOrderWithRelations) => void
  onDelete: (order: SaleOrderWithRelations) => void
}

export function SaleOrdersHistoryRowActions({
  row,
  onEdit,
  onDelete,
}: SaleOrdersHistoryRowActionsProps) {
  const isDraft = row.original.status === '1_DRAFT'

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
      disabled: !isDraft,
      tooltip: 'Chỉ được phép xoá đơn nháp',
      onClick: () => onDelete(row.original),
    },
  ]

  return <RowActions actions={actions} />
}
