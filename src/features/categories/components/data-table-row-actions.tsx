import { type Row } from '@tanstack/react-table'
import { SquarePen, Trash2 } from 'lucide-react'
import {
  DataTableRowActions as RowActions,
  type RowAction,
} from '@/components/data-table-row-actions'
import { type Category } from '../data/schema'
import { useCategories } from './categories-provider'
import { usePermissions } from '@/hooks/use-permissions'

type DataTableRowActionsProps = {
  row: Row<Category>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useCategories()
  const { canEdit } = usePermissions()

  if (!canEdit('categories')) return null
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
      onClick: () => {
        setCurrentRow(row.original)
        setOpen('delete')
      },
    },
  ]

  return <RowActions actions={actions} />
}
