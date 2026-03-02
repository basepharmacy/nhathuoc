'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser } from '@/client/provider'
import { bankAccountsRepo } from '@/client'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { bankByBin } from '@/components/bank-combobox'
import { type BankAccount } from '../data/schema'

type BankAccountsDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: BankAccount
}

export function BankAccountsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: BankAccountsDeleteDialogProps) {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => bankAccountsRepo.deleteBankAccount(currentRow.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts', tenantId] })
      onOpenChange(false)
    },
  })

  const bank = bankByBin.get(currentRow.bank_bin)
  const bankName = bank?.shortName || bank?.name || currentRow.bank_bin

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      handleConfirm={() => deleteMutation.mutate()}
      disabled={deleteMutation.isPending}
      title='Xóa tài khoản thanh toán'
      desc={
        <>
          Bạn có chắc chắn muốn xóa tài khoản{' '}
          <span className='font-bold'>
            {bankName} - {currentRow.account_number}
          </span>
          ?
        </>
      }
      confirmText='Xóa'
      destructive
    />
  )
}
