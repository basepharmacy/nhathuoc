'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useUser } from '@/client/provider'
import { productsRepo, purchaseOrdersRepo, saleOrdersRepo } from '@/client'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { mapSupabaseError } from '@/lib/error-mapper'
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
    mutationFn: async () => {
      // Sản phẩm đã phát sinh giao dịch bán hoặc nhập thì không được xoá.
      // Chỉ có tồn kho hoặc phiếu điều chỉnh kho thì vẫn xoá được (dữ liệu đó bị xoá theo).
      const [saleItemCount, purchaseItemCount] = await Promise.all([
        saleOrdersRepo.countSaleOrderItemsByProductId({
          tenantId,
          productId: currentRow.id,
        }),
        purchaseOrdersRepo.countPurchaseOrderItemsByProductId({
          tenantId,
          productId: currentRow.id,
        }),
      ])

      if (saleItemCount > 0) {
        throw new Error('PRODUCT_HAS_SALE_HISTORY')
      }

      if (purchaseItemCount > 0) {
        throw new Error('PRODUCT_HAS_PURCHASE_HISTORY')
      }

      await productsRepo.deleteProduct(currentRow.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products', tenantId] })
      queryClient.invalidateQueries({ queryKey: ['inventory-batches', tenantId] })
      queryClient.invalidateQueries({ queryKey: ['inventory-products', tenantId] })
      onOpenChange(false)
      toast.success('Đã xóa sản phẩm.')
    },
    onError: (error) => {
      toast.error(mapSupabaseError(error))
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
          <br />
          Tồn kho và phiếu điều chỉnh kho của sản phẩm này cũng sẽ bị xóa. Sản phẩm đã
          có lịch sử bán hàng hoặc nhập hàng sẽ không xóa được.
        </>
      }
      confirmText='Xóa'
      destructive
    />
  )
}
