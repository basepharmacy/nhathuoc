import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { suppliersRepo } from '@/client'
import { useUser } from '@/client/provider'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import { type Supplier } from '@/features/suppliers/data/schema'
import { useSuppliers } from '@/features/suppliers/components/suppliers-provider'

type SupplierActionsProps = {
  isActive: boolean | null
  supplier: Supplier | null
}

export function SupplierActions({ isActive, supplier }: SupplierActionsProps) {
  const { setOpen, setCurrentRow } = useSuppliers()
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const updateStatusMutation = useMutation({
    mutationFn: (nextIsActive: boolean) => {
      if (!supplier) {
        throw new Error('Không tìm thấy nhà cung cấp.')
      }
      return suppliersRepo.updateSupplier(supplier.id, { is_active: nextIsActive })
    },
    onSuccess: () => {
      if (!supplier) return
      queryClient.invalidateQueries({ queryKey: ['suppliers', tenantId] })
      queryClient.invalidateQueries({
        queryKey: ['suppliers', tenantId, 'detail', supplier.id],
      })
      setConfirmOpen(false)
    },
    onError: () => {
      setConfirmOpen(false)
    },
  })

  const handleToggleStatus = () => {
    if (!supplier) return
    const nextIsActive = isActive === false
    if (!nextIsActive) {
      setConfirmOpen(true)
      return
    }
    updateStatusMutation.mutate(nextIsActive)
  }

  return (
    <>
      <div className='flex flex-wrap items-center gap-2'>
        <Button
          variant='outline'
          className='border-destructive/40 text-destructive hover:bg-destructive/10'
          disabled={!supplier || updateStatusMutation.isPending}
          onClick={handleToggleStatus}
        >
          {isActive === false ? 'Mở giao dịch' : 'Ngừng giao dịch'}
        </Button>
        <Button
          variant='destructive'
          disabled={!supplier}
          onClick={() => {
            if (!supplier) return
            setCurrentRow(supplier)
            setOpen('delete')
          }}
        >
          Xoá
        </Button>
        <Button
          disabled={!supplier}
          onClick={() => {
            if (!supplier) return
            setCurrentRow(supplier)
            setOpen('edit')
          }}
        >
          Chỉnh sửa
        </Button>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        handleConfirm={() => updateStatusMutation.mutate(false)}
        disabled={updateStatusMutation.isPending}
        isLoading={updateStatusMutation.isPending}
        title='Ngừng giao dịch'
        desc={
          <>
            Bạn có chắc chắn muốn ngừng giao dịch với{' '}
            <span className='font-bold'>{supplier?.name ?? 'nhà cung cấp'}</span>?
          </>
        }
        confirmText='Ngừng giao dịch'
        cancelBtnText='Huỷ'
        destructive
      />
    </>
  )
}
