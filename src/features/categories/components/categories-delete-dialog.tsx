'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/client/provider'
import { categoriesRepo } from '@/client'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Category } from '../data/schema'

type CategoriesDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Category
}

export function CategoriesDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: CategoriesDeleteDialogProps) {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => categoriesRepo.deleteCategory(currentRow.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', tenantId] })
      onOpenChange(false)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
      title='Xóa danh mục'
      desc={
        <>
          Bạn có chắc chắn muốn xóa danh mục{' '}
          <span className='font-bold'>{currentRow.name}</span>?
        </>
      }
      confirmText='Xóa'
      destructive
    />
  )
}
