'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/client/provider'
import { productsRepo } from '@/client'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ProductWithUnits } from '@/services/supabase'

type ProductsDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: ProductWithUnits
}

export function ProductsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: ProductsDeleteDialogProps) {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => productsRepo.deleteProduct(currentRow.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', tenantId] })
      onOpenChange(false)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
      title='Xóa sản phẩm'
      desc={
        <>
          Bạn có chắc chắn muốn xóa sản phẩm{' '}
          <span className='font-bold'>{currentRow.product_name}</span>?
        </>
      }
      confirmText='Xóa'
      destructive
    />
  )
}
