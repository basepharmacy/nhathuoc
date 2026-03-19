import { type Row } from '@tanstack/react-table'
import { Printer, Trash2 } from 'lucide-react'
import {
  DataTableRowActions as RowActions,
  type RowAction,
} from '@/components/data-table-row-actions'
import { type SupplierPaymentWithSupplier } from '@/services/supabase/database/repo/supplierPaymentsRepo'

type SupplierPaymentsHistoryRowActionsProps = {
  row: Row<SupplierPaymentWithSupplier>
  onPrint?: (payment: SupplierPaymentWithSupplier) => void
  onDelete?: (payment: SupplierPaymentWithSupplier) => void
}

export function SupplierPaymentsHistoryRowActions({
  row,
  onPrint,
  onDelete,
}: SupplierPaymentsHistoryRowActionsProps) {
  const actions: RowAction[] = [
    ...(onPrint ? [{
      label: 'In hoá đơn',
      icon: Printer,
      onClick: () => onPrint(row.original),
    }] : []),
    ...(onDelete ? [{
      label: 'Xóa',
      icon: Trash2,
      destructive: true,
      onClick: () => onDelete(row.original),
    }] : []),
  ]

  if (actions.length === 0) return null

  return <RowActions actions={actions} />
}
