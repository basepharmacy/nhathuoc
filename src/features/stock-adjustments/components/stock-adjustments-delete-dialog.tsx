import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/client/provider'
import { stockAdjustmentsRepo } from '@/client'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type StockAdjustmentWithRelations } from '@/services/supabase/database/repo/stockAdjustmentsRepo'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: StockAdjustmentWithRelations
}

export function StockAdjustmentsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: Props) {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => stockAdjustmentsRepo.deleteStockAdjustment(currentRow.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-adjustments', tenantId] })
      onOpenChange(false)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
      title='Xóa điều chỉnh tồn kho'
      desc={
        <>
          Bạn có chắc chắn muốn xóa điều chỉnh cho sản phẩm{' '}
          <span className='font-bold'>
            {currentRow.products?.product_name ?? currentRow.batch_code}
          </span>
          ?
        </>
      }
      confirmText='Xóa'
      destructive
    />
  )
}
