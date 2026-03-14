import { type Row } from '@tanstack/react-table'
import { Eye, Trash2, UserPen } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import {
  DataTableRowActions as RowActions,
  type RowAction,
} from '@/components/data-table-row-actions'
import { Can } from '@/components/permission-guard'
import { type StaffUser } from '../data/staff-schema'
import { useStaff } from './staff-provider'

type DataTableRowActionsProps = {
  row: Row<StaffUser>
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useStaff()
  const navigate = useNavigate()
  const isOwner = row.original.role === 'OWNER'

  const actions: RowAction[] = [
    {
      label: 'Xem chi tiết',
      icon: Eye,
      onClick: () => {
        navigate({ to: '/staffs/$staffId', params: { staffId: row.original.id } })
      },
    },
    {
      label: 'Chỉnh sửa',
      icon: UserPen,
      onClick: () => {
        setCurrentRow(row.original)
        setOpen('edit')
      },
    },
    {
      label: 'Xóa',
      icon: Trash2,
      destructive: true,
      disabled: isOwner,
      tooltip: 'Không thể xoá tài khoản chủ hệ thống',
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
