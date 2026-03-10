import { type Row } from '@tanstack/react-table'
import { Pencil, Trash2 } from 'lucide-react'
import {
  DataTableRowActions as RowActions,
  type RowAction,
} from '@/components/data-table-row-actions'
import { type ProductWithUnits } from '@/services/supabase'
import { useProducts } from './products-provider'

type DataTableRowActionsProps = {
  row: Row<ProductWithUnits>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useProducts()
  const isDraft = row.original.status === '1_DRAFT'

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
      disabled: !isDraft,
      tooltip: 'Chỉ được phép xoá sản phẩm ở trạng thái nháp',
      onClick: () => {
        setCurrentRow(row.original)
        setOpen('delete')
      },
    },
  ]

  return <RowActions actions={actions} />
}
