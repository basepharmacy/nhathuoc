import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { purchaseOrdersRepo } from '@/client'
import { type PurchaseOrderWithRelations } from '@/services/supabase'

export function useDeletePurchaseOrder(tenantId: string) {
  const queryClient = useQueryClient()

  const [deleteTarget, setDeleteTarget] = useState<PurchaseOrderWithRelations | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteTarget || !tenantId) {
        throw new Error('Thiếu thông tin đơn nhập hàng.')
      }
      await purchaseOrdersRepo.deletePurchaseOrder({
        orderId: deleteTarget.id,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['purchase-orders', tenantId, 'history'],
      })
      setDeleteOpen(false)
      setDeleteTarget(null)
      toast.success('Đã xóa đơn nhập hàng.')
    },
    onError: (error) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Đã xảy ra lỗi, vui lòng thử lại.'
      toast.error(message)
    },
  })

  const handleDelete = useCallback((order: PurchaseOrderWithRelations) => {
    if (order.status !== '1_DRAFT') {
      toast.error('Chỉ có thể xóa đơn nháp.')
      return
    }
    setDeleteTarget(order)
    setDeleteOpen(true)
  }, [])

  const handleDeleteDialogOpenChange = useCallback(
    (open: boolean) => {
      setDeleteOpen(open)
      if (!open) {
        setDeleteTarget(null)
      }
    },
    []
  )

  const deleteState = useMemo(() => {
    if (!deleteTarget) return null
    return {
      target: deleteTarget,
      open: deleteOpen,
      onOpenChange: handleDeleteDialogOpenChange,
      disabled: deleteMutation.isPending,
      onConfirm: () => deleteMutation.mutate(),
    }
  }, [deleteTarget, deleteOpen, handleDeleteDialogOpenChange, deleteMutation])

  return { deleteState, handleDelete }
}
