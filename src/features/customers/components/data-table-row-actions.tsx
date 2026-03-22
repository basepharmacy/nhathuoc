import { type Row } from '@tanstack/react-table'
import { SquarePen, Trash2 } from 'lucide-react'
import {
  DataTableRowActions as RowActions,
  type RowAction,
} from '@/components/data-table-row-actions'
import { usePermissions } from '@/hooks/use-permissions'
import { type Customer } from '../data/schema'
import { useCustomers } from './customers-provider'

type DataTableRowActionsProps = {
  row: Row<Customer>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useCustomers()
  const { role } = usePermissions()

  const actions: RowAction[] = [
    {
      label: 'Chỉnh sửa',
      icon: SquarePen,
      onClick: () => {
        setCurrentRow(row.original)
        setOpen('edit')
      },
    },
    {
      label: 'Xóa',
      icon: Trash2,
      destructive: true,
      hidden: role !== 'OWNER',
      onClick: () => {
        setCurrentRow(row.original)
        setOpen('delete')
      },
    },
  ]

  return <RowActions actions={actions} />
}
