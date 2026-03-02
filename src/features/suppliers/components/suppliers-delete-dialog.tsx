'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { suppliersRepo } from '@/client'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Supplier } from '../data/schema'

type SuppliersDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Supplier
}

export function SuppliersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: SuppliersDeleteDialogProps) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => suppliersRepo.deleteSupplier(currentRow.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] })
      onOpenChange(false)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
      title='Xóa nhà cung cấp'
      desc={
        <>
          Bạn có chắc chắn muốn xóa nhà cung cấp{' '}
          <span className='font-bold'>{currentRow.name}</span>?
        </>
      }
      confirmText='Xóa'
      destructive
    />
  )
}
