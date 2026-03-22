import { type Row } from '@tanstack/react-table'
import { SquarePen, Trash2 } from 'lucide-react'
import {
  DataTableRowActions as RowActions,
  type RowAction,
} from '@/components/data-table-row-actions'
import { usePermissions } from '@/hooks/use-permissions'
import { type Supplier } from '../data/schema'
import { useSuppliers } from './suppliers-provider'

type DataTableRowActionsProps = {
  row: Row<Supplier>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useSuppliers()
  const { canEdit } = usePermissions()

  const actions: RowAction[] = [
    ...(canEdit('suppliers') ? [
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
        onClick: () => {
          setCurrentRow(row.original)
          setOpen('delete')
        },
      },
    ] : []),
  ]

  return <RowActions actions={actions} />
}
