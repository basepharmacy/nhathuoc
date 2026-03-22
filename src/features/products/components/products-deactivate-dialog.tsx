'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/client/provider'
import { productsRepo } from '@/client'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ProductWithUnits } from '@/services/supabase'

type ProductsDeactivateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: ProductWithUnits
}

export function ProductsDeactivateDialog({
  open,
  onOpenChange,
  currentRow,
}: ProductsDeactivateDialogProps) {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()

  const deactivateMutation = useMutation({
    mutationFn: () =>
      productsRepo.updateProduct(currentRow.id, { status: '3_INACTIVE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', tenantId] })
      onOpenChange(false)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={() => deactivateMutation.mutate()}
      disabled={deactivateMutation.isPending}
      title='Ngừng bán sản phẩm'
      desc={
        <>
          Bạn có chắc chắn muốn ngừng bán sản phẩm{' '}
          <span className='font-bold'>{currentRow.product_name}</span>?
        </>
      }
      confirmText='Ngừng bán'
      destructive
    />
  )
}
