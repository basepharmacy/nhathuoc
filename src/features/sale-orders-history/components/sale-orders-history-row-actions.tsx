import { type Row } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import {
  DataTableRowActions as RowActions,
  type RowAction,
} from '@/components/data-table-row-actions'
import { type SaleOrderWithRelations } from '@/services/supabase/'

type SaleOrdersHistoryRowActionsProps = {
  row: Row<SaleOrderWithRelations>
  onDelete: (order: SaleOrderWithRelations) => void
}

export function SaleOrdersHistoryRowActions({
  row,
  onDelete,
}: SaleOrdersHistoryRowActionsProps) {
  const isDraft = row.original.status === '1_DRAFT'

  const actions: RowAction[] = [
    {
      label: 'Xóa',
      icon: Trash2,
      destructive: true,
      disabled: !isDraft,
      tooltip: !isDraft ? 'Chỉ được phép xoá đơn nháp' : undefined,
      onClick: () => onDelete(row.original),
    },
  ]

  return <RowActions actions={actions} />
}
