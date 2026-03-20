import { type Row } from '@tanstack/react-table'
import { useNavigate } from '@tanstack/react-router'
import { Eye, SquarePen, Trash2 } from 'lucide-react'
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
  const navigate = useNavigate()

  const actions: RowAction[] = [
    {
      label: 'Xem chi tiết',
      icon: Eye,
      onClick: () =>
        navigate({
          to: '/customers/$customerId',
          params: { customerId: row.original.id },
        }),
    },
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
