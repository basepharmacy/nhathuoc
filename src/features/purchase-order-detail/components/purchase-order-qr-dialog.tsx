import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSupplierBankAccountsQueryOptions } from '@/client/queries'
import { bankByBin } from '@/components/bank-combobox'
import { buildVietQrUrl } from '@/lib/viet-qr'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type PurchaseOrderQrDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  supplierId: string
  amount: number
  orderCode: string
}

export function PurchaseOrderQrDialog({
  open,
  onOpenChange,
  supplierId,
  amount,
  orderCode,
}: PurchaseOrderQrDialogProps) {
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)

  const { data: bankAccounts = [] } = useQuery({
    ...getSupplierBankAccountsQueryOptions(supplierId),
    enabled: !!supplierId && open,
  })

  const selectedAccount = useMemo(() => {
    if (!bankAccounts.length) return null
    if (selectedAccountId) {
      const found = bankAccounts.find((a) => a.id === selectedAccountId)
      if (found) return found
    }
    return bankAccounts.find((a) => a.is_default) ?? bankAccounts[0]
  }, [bankAccounts, selectedAccountId])

  const note = `Thanh toan cho don hang ${orderCode}`

  const qrUrl = useMemo(() => {
    if (!selectedAccount) return null
    return buildVietQrUrl(
      selectedAccount.bank_bin,
      selectedAccount.account_number,
      selectedAccount.account_holder,
      amount,
      note
    )
  }, [selectedAccount, amount, note])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-sm'>
        <DialogHeader>
          <DialogTitle>QR thanh toán</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col items-center gap-4'>
          {bankAccounts.length > 1 && (
            <Select
              value={selectedAccount?.id ?? ''}
              onValueChange={setSelectedAccountId}
            >
              <SelectTrigger className='w-full'>
                <SelectValue placeholder='Chọn tài khoản' />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map((account) => {
                  const bank = bankByBin.get(account.bank_bin)
                  return (
                    <SelectItem key={account.id} value={account.id}>
                      {bank?.shortName ?? bank?.name ?? account.bank_bin} - {account.account_number}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          )}
          {selectedAccount && qrUrl ? (
            <>
              <img
                src={qrUrl}
                alt='QR chuyển khoản'
                width={220}
                height={220}
                className='rounded-lg border'
              />
              <div className='w-full space-y-1 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Ngân hàng</span>
                  <span className='font-medium'>
                    {bankByBin.get(selectedAccount.bank_bin)?.shortName
                      ?? bankByBin.get(selectedAccount.bank_bin)?.name
                      ?? selectedAccount.bank_bin}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Số tài khoản</span>
                  <span className='font-medium'>{selectedAccount.account_number}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-muted-foreground'>Chủ tài khoản</span>
                  <span className='font-medium'>{selectedAccount.account_holder}</span>
                </div>
              </div>
            </>
          ) : (
            <p className='text-sm text-muted-foreground'>
              Nhà cung cấp chưa có tài khoản ngân hàng.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
