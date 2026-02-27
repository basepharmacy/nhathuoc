'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/client/provider'
import { customersRepo } from '@/client'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { type Customer } from '../data/schema'

type CustomersDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: Customer
}

export function CustomersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: CustomersDeleteDialogProps) {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => customersRepo.deleteCustomer(currentRow.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers', tenantId] })
      onOpenChange(false)
    },
  })

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
      title='Xóa khách hàng'
      desc={
        <>
          Bạn có chắc chắn muốn xóa khách hàng{' '}
          <span className='font-bold'>{currentRow.name}</span>?
        </>
      }
      confirmText='Xóa'
      destructive
    />
  )
}
