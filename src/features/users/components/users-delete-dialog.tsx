'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { useUser } from '@/client/provider'
import { userAccountsRepo } from '@/client'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type StaffUser } from '../data/schema'

type UserDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: StaffUser
}

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: UserDeleteDialogProps) {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => userAccountsRepo.deleteUser(currentRow.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-users', tenantId] })
      onOpenChange(false)
    },
  })

  const handleDelete = () => {
    deleteMutation.mutate()
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={handleDelete}
      disabled={deleteMutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Xóa nhân viên
        </span>
      }
      desc={
        <p>
          Bạn có chắc chắn muốn xóa nhân viên{' '}
          <span className='font-bold'>{currentRow.name}</span>? Hành động này
          không thể hoàn tác.
        </p>
      }
      confirmText='Xóa'
      destructive
    />
  )
}
