import { type Row } from '@tanstack/react-table'
import { SquarePen, Trash2 } from 'lucide-react'
import {
  DataTableRowActions as RowActions,
  type RowAction,
} from '@/components/data-table-row-actions'
import { Can } from '@/components/permission-guard'
import { type Location } from '@/services/supabase'
import { useLocations } from './locations-provider'

type DataTableRowActionsProps = {
  row: Row<Location>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useLocations()

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

  return (
    <RowActions
      actions={actions}
      wrapper={(children) => (
        <Can feature='locations' action='edit'>
          {children}
        </Can>
      )}
    />
  )
}
