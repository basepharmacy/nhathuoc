import { type Row } from '@tanstack/react-table'
import { useNavigate } from '@tanstack/react-router'
import { Eye, Pencil, Trash2, Wallet } from 'lucide-react'
import {
  DataTableRowActions as RowActions,
  type RowAction,
} from '@/components/data-table-row-actions'
import { type Supplier } from '../data/schema'
import { useSuppliers } from './suppliers-provider'

type DataTableRowActionsProps = {
  row: Row<Supplier>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useSuppliers()
  const navigate = useNavigate()

  const actions: RowAction[] = [
    {
      label: 'Xem chi tiết',
      icon: Eye,
      onClick: () =>
        navigate({
          to: '/suppliers/$supplierId',
          params: { supplierId: row.original.id },
        }),
    },
    {
      label: 'Thanh toán',
      icon: Wallet,
      onClick: () => {
        setCurrentRow(row.original)
        setOpen('payment')
      },
    },
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

  return <RowActions actions={actions} />
}
