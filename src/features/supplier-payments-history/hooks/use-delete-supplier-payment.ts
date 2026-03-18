import { useCallback, useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supplierPaymentsRepo } from '@/client'
import { type SupplierPayment } from '@/services/supabase/database/repo/supplierPaymentsRepo'

export function useDeleteSupplierPayment<TData extends SupplierPayment = SupplierPayment>(
  tenantId: string,
  options?: { additionalQueryKeys?: string[][] }
) {
  const queryClient = useQueryClient()

  const [deleteTarget, setDeleteTarget] = useState<TData | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!deleteTarget || !tenantId) {
        throw new Error('Thiếu thông tin phiếu thanh toán.')
      }
      await supplierPaymentsRepo.deleteSupplierPayment(deleteTarget.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['supplier-payments'],
      })
      if (options?.additionalQueryKeys) {
        for (const key of options.additionalQueryKeys) {
          queryClient.invalidateQueries({ queryKey: key })
        }
      }
      setDeleteOpen(false)
      setDeleteTarget(null)
      toast.success('Đã xóa phiếu thanh toán.')
    },
    onError: (error) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Đã xảy ra lỗi, vui lòng thử lại.'
      toast.error(message)
    },
  })

  const handleDelete = useCallback((payment: TData) => {
    setDeleteTarget(payment)
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
