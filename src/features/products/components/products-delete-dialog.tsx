'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productsRepo } from '@/client'
import { useUser } from '@/client/provider'
import { AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Product } from '../data/schema'

type ProductsDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Product
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
    mutationFn: () => productsRepo.deleteProductById(tenantId, currentRow.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products', tenantId] })
      onOpenChange(false)
      toast.success('Đã xóa sản phẩm thành công.')
    },
    onError: (error) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Không thể xóa sản phẩm. Vui lòng thử lại.'

      toast.error(message)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={() => {
        if (!tenantId || deleteMutation.isPending) {
          return
        }

        deleteMutation.mutate()
      }}
      disabled={!tenantId}
      isLoading={deleteMutation.isPending}
      title={
        <span className='text-destructive'>
          <AlertTriangle
            className='me-1 inline-block stroke-destructive'
            size={18}
          />{' '}
          Xóa sản phẩm
        </span>
      }
      desc={
        <div className='space-y-4'>
          <p>
            Bạn có chắc chắn muốn xóa sản phẩm{' '}
            <span className='font-semibold'>{currentRow.product_name}</span>?{' '}
            Thao tác này sẽ xóa luôn các đơn vị tính liên quan và không thể hoàn
            tác.
          </p>

          <Alert variant='destructive'>
            <AlertTitle>Cảnh báo</AlertTitle>
            <AlertDescription>
              Hệ thống sẽ chặn xóa nếu sản phẩm đang được tham chiếu bởi dữ liệu
              nhập kho hoặc tồn kho.
            </AlertDescription>
          </Alert>
        </div>
      }
      confirmText={deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
      destructive
    />
  )
}
