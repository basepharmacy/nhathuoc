import { type Row } from '@tanstack/react-table'
import { Pencil, Trash2 } from 'lucide-react'
import {
  DataTableRowActions as RowActions,
  type RowAction,
} from '@/components/data-table-row-actions'
import { Can } from '@/components/permission-guard'
import { type BankAccount } from '../data/schema'
import { useBankAccounts } from './bank-accounts-provider'

type DataTableRowActionsProps = {
  row: Row<BankAccount>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useBankAccounts()

  const actions: RowAction[] = [
    {
      label: 'Chỉnh sửa',
      icon: Pencil,
      onClick: () => {
        setCurrentRow(row.original)
        setOpen('edit')
      },
    },
    {
      label: 'Xóa',
      icon: Trash2,
      destructive: true,
      onClick: () => {
        setCurrentRow(row.original)
        setOpen('delete')
      },
    },
  ]

  return (
    <RowActions
      actions={actions}
      wrapper={(children) => (
        <Can feature='settings' action='edit'>
          {children}
        </Can>
      )}
    />
  )
}
