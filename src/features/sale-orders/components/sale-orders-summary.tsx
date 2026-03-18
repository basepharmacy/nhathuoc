import { memo, useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { DiscountInput } from '@/components/discount-input'
import { CurrencyInput } from '@/components/ui/currency-input'
import { Separator } from '@/components/ui/separator'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn, formatCurrency } from '@/lib/utils'
import { bankByBin } from '@/components/bank-combobox'
import { type PaymentMethod } from '../data/types'
import type { Customer, BankAccount } from '@/services/supabase/'
import { CustomerSwitcher } from './customer-switcher'
import { useSaleOrderStore } from '../store/sale-order-context'
import { selectSubtotal } from '../store/sale-order-selectors'

type SaleOrdersSummaryProps = {
  customers: Customer[]
  bankAccounts: BankAccount[]
  onSaveDraft: () => void
  onSubmit: () => void
  isSubmitting: boolean
}

const PAYMENT_METHODS: Array<{ label: string; value: PaymentMethod }> = [
  { label: 'Tiền mặt', value: '1_CASH' },
  { label: 'Chuyển khoản', value: '2_BANK_TRANSFER' },
]

const DENOMINATIONS = [1000, 2000, 5000, 10_000, 20_000, 50_000, 100_000, 200_000, 500_000]

function getCashPresets(total: number): number[] {
  if (total <= 0) return []
  const presets: number[] = [total]
  for (const d of DENOMINATIONS) {
    const rounded = Math.ceil(total / d) * d
    if (rounded > total) presets.push(rounded)
  }
  const unique = [...new Set(presets)].sort((a, b) => a - b)
  return unique.slice(0, 6)
}

export const SaleOrdersSummary = memo(function SaleOrdersSummary({
  customers,
  bankAccounts,
  onSaveDraft,
  onSubmit,
  isSubmitting,
}: SaleOrdersSummaryProps) {
  // ── Store ──────────────────────────────────────────────────
  const customerId = useSaleOrderStore((s) => s.customerId)
  const setCustomerId = useSaleOrderStore((s) => s.setCustomerId)
  const orderDiscount = useSaleOrderStore((s) => s.orderDiscount)
  const setOrderDiscount = useSaleOrderStore((s) => s.setOrderDiscount)
  const paymentMethod = useSaleOrderStore((s) => s.paymentMethod)
  const setPaymentMethod = useSaleOrderStore((s) => s.setPaymentMethod)
  const cashReceived = useSaleOrderStore((s) => s.cashReceived)
  const setCashReceived = useSaleOrderStore((s) => s.setCashReceived)
  const bankAccountId = useSaleOrderStore((s) => s.bankAccountId)
  const setBankAccountId = useSaleOrderStore((s) => s.setBankAccountId)
  const notes = useSaleOrderStore((s) => s.notes)
  const setNotes = useSaleOrderStore((s) => s.setNotes)
  const setIsAddCustomerOpen = useSaleOrderStore((s) => s.setIsAddCustomerOpen)
  const subtotal = useSaleOrderStore(selectSubtotal)

  const [cashPopoverOpen, setCashPopoverOpen] = useState(false)

  const total = useMemo(
    () => Math.max(0, subtotal - orderDiscount),
    [subtotal, orderDiscount]
  )
  const changeAmount = Math.max(0, cashReceived - subtotal)

  // tự động set lại orderDiscount về 0 nếu subtotal thay đổi và orderDiscount đang lớn hơn subtotal mới
  useEffect(() => {
    if (orderDiscount > subtotal) {
      setOrderDiscount(0)
    }
  }, [subtotal])

  useEffect(() => {
    if (bankAccounts.length === 0) return
    const defaultAccount = bankAccounts.find((account) => account.is_default) ?? bankAccounts[0]
    if (defaultAccount) {
      setBankAccountId(defaultAccount.id)
    }
  }, [bankAccounts])

  return (
    <div className='space-y-4 rounded-xl border bg-card p-4 shadow-sm h-full'>
      <CustomerSwitcher
        customers={customers}
        selectedCustomerId={customerId}
        onChange={setCustomerId}
        onAddCustomer={() => setIsAddCustomerOpen(true)}
      />

      <Separator />

      <div className='space-y-2 text-sm'>
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Tổng tiền</span>
          <span className='font-semibold text-foreground'>
            {formatCurrency(subtotal)}đ
          </span>
        </div>
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Chiết khấu</span>
          <DiscountInput
            subtotal={subtotal}
            value={orderDiscount}
            onChange={setOrderDiscount}
          />
        </div>
      </div>

      <Separator />

      <div className='space-y-2 text-center'>
        <div className='text-sm text-muted-foreground'>Cần thanh toán</div>
        <div className='text-3xl font-bold text-foreground'>
          {formatCurrency(total)}đ
        </div>
      </div>

      <Separator />

      <div className='space-y-3'>
        <div className='grid grid-cols-2 gap-2'>
          {PAYMENT_METHODS.map((option) => (
            <Button
              key={option.value}
              type='button'
              variant={paymentMethod === option.value ? 'default' : 'outline'}
              className={cn(
                'h-auto min-h-10 w-full rounded-full px-2 py-2 text-xs leading-4 whitespace-normal',
                paymentMethod !== option.value && 'text-muted-foreground'
              )}
              onClick={() => setPaymentMethod(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {paymentMethod === '1_CASH' ? (
          <div className='space-y-2 text-sm'>
            <div className='flex items-center justify-between text-muted-foreground'>
              <span>Khách đưa</span>
              <Popover open={cashPopoverOpen} onOpenChange={setCashPopoverOpen}>
                <PopoverTrigger asChild>
                  <div>
                    <CurrencyInput
                      value={cashReceived}
                      onValueChange={setCashReceived}
                      onClick={() => setCashPopoverOpen(true)}
                      className='h-8 w-28 rounded-full text-right text-xs'
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  align='end'
                  className='w-auto p-2'
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <div className='flex flex-wrap gap-1.5'>
                    {getCashPresets(total).map((preset) => (
                      <Button
                        key={preset}
                        type='button'
                        variant='outline'
                        size='sm'
                        className='h-7 rounded-full px-2.5 text-xs'
                        onClick={() => {
                          setCashReceived(preset)
                          setCashPopoverOpen(false)
                        }}
                      >
                        {formatCurrency(preset)}đ
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className='flex items-center justify-between text-muted-foreground'>
              <span>Tiền thừa</span>
              <span className='font-semibold text-foreground'>
                {formatCurrency(changeAmount)}đ
              </span>
            </div>
          </div>
        ) : (
          <div className='space-y-2 text-sm'>
            <div className='space-y-1 text-muted-foreground'>
              <span className='text-xs'>Tài khoản thanh toán</span>
              <Select
                value={bankAccountId}
                onValueChange={setBankAccountId}
                disabled={bankAccounts.length === 0}
              >
                <SelectTrigger className='h-9 rounded-full text-xs'>
                  <SelectValue placeholder='Chọn tài khoản ngân hàng' />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => {
                    const bank = bankByBin.get(account.bank_bin)
                    const bankName = bank?.shortName || bank?.name || account.bank_bin
                    return (
                      <SelectItem key={account.id} value={account.id}>
                        {bankName} - {account.account_number}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            {bankAccounts.length === 0 ? (
              <span className='text-xs text-muted-foreground'>
                Chưa có tài khoản ngân hàng.
              </span>
            ) : null}
          </div>
        )}
      </div>

      <Separator />
      <div className='flex gap-2'>
        <Button
          type='button'
          variant='outline'
          className='h-9 flex-1 rounded-xl'
          onClick={onSaveDraft}
          disabled={isSubmitting}
        >
          Lưu nháp (F3)
        </Button>
        <Button
          type='button'
          className='h-9 flex-1 rounded-xl'
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          Hoàn tất (F9)
        </Button>
      </div>

      <Textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder='Ghi chú đơn bán hàng'
        className='min-h-[120px] rounded-xl'
      />
    </div>
  )
})
