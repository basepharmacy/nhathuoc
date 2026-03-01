'use client'

import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Supplier } from '../data/schema'

type MutationOptions = {
  onSuccess?: () => void
}

type SupplierDeleteMutation = {
  mutate: (supplierId: string, options?: MutationOptions) => void
  isPending: boolean
}

type SuppliersDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Supplier
  deleteMutation: SupplierDeleteMutation
}

export function SuppliersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
  deleteMutation,
}: SuppliersDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={() =>
        deleteMutation.mutate(currentRow.id, {
          onSuccess: () => onOpenChange(false),
        })
      }
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
