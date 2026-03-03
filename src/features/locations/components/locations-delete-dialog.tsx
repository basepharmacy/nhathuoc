'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/client/provider'
import { locationsRepo } from '@/client'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Location } from '@/services/supabase'

type LocationsDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Location
}

export function LocationsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: LocationsDeleteDialogProps) {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => locationsRepo.deleteLocation(currentRow.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations', tenantId] })
      onOpenChange(false)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
      title='Xóa cửa hàng'
      desc={
        <>
          Bạn có chắc chắn muốn xóa cửa hàng{' '}
          <span className='font-bold'>{currentRow.name}</span>?
        </>
      }
      confirmText='Xóa'
      destructive
    />
  )
}
