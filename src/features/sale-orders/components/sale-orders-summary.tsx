import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DiscountInput } from '@/components/discount-input'
import { Input } from '@/components/ui/input'
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
import { cn, formatCurrency, normalizeNumber } from '@/lib/utils'
import { bankByBin } from '@/components/bank-combobox'
import { type PaymentMethod } from '../data/types'
import type { Customer, BankAccount, SaleOrder } from '@/services/supabase/'
import { CustomerSwitcher } from './customer-switcher'

type SaleOrdersSummaryProps = {
  customers: Customer[]
  customerId: string
  onCustomerChange: (customerId: string) => void
  onAddCustomer: () => void
  totals: {
    subtotal: number
    total: number
  }
  orderDiscount: number
  onOrderDiscountChange: (value: number) => void
  paymentMethod: PaymentMethod
  onPaymentMethodChange: (value: PaymentMethod) => void
  cashReceived: number
  onCashReceivedChange: (value: number) => void
  changeAmount: number
  bankAccounts: BankAccount[]
  bankAccountId: string
  onBankAccountChange: (value: string) => void
  notes: string
  onNotesChange: (value: string) => void
  onSaveDraft: () => void
  onSubmit: () => void
  onCancelOrder?: () => void
  isSubmitting: boolean
  orderStatus: SaleOrder['status']
}

const PAYMENT_METHODS: Array<{ label: string; value: PaymentMethod }> = [
  { label: 'Tiền mặt', value: 'CASH' },
  { label: 'Chuyển khoản', value: 'TRANSFER' },
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

export function SaleOrdersSummary({
  customers,
  customerId,
  onCustomerChange,
  onAddCustomer,
  totals,
  orderDiscount,
  onOrderDiscountChange,
  paymentMethod,
  onPaymentMethodChange,
  cashReceived,
  onCashReceivedChange,
  changeAmount,
  bankAccounts,
  bankAccountId,
  onBankAccountChange,
  notes,
  onNotesChange,
  onSaveDraft,
  onSubmit,
  onCancelOrder,
  isSubmitting,
  orderStatus,
}: SaleOrdersSummaryProps) {
  const [cashPopoverOpen, setCashPopoverOpen] = useState(false)
  const isDraft = orderStatus === '1_DRAFT'
  const isComplete = orderStatus === '2_COMPLETE'
  const isEditable = isDraft
  const isReadOnly = !isEditable
  const submitLabel = isComplete ? 'Đã hoàn tất' : 'Hoàn tất (F9)'
  const showSaveDraft = isDraft
  const saveDraftDisabled = !isDraft
  const customerDisabled = !isDraft
  const showSubmit = isEditable
  const showCancelOrder = isComplete

  return (
    <div className='space-y-4 rounded-xl border bg-card p-4 shadow-sm h-full'>
      <CustomerSwitcher
        customers={customers}
        activeCustomerId={customerId}
        onChange={onCustomerChange}
        onAddCustomer={onAddCustomer}
        disabled={customerDisabled}
      />

      <Separator />

      <div className='space-y-2 text-sm'>
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Tổng tiền</span>
          <span className='font-semibold text-foreground'>
            {formatCurrency(totals.subtotal)}đ
          </span>
        </div>
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Chiết khấu</span>
          <DiscountInput
            subtotal={totals.subtotal}
            value={orderDiscount}
            onChange={onOrderDiscountChange}
            disabled={isReadOnly}
          />
        </div>
      </div>

      <Separator />

      <div className='space-y-2 text-center'>
        <div className='text-sm text-muted-foreground'>Cần thanh toán</div>
        <div className='text-3xl font-bold text-foreground'>
          {formatCurrency(totals.total)}đ
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
              onClick={() => onPaymentMethodChange(option.value)}
              disabled={isReadOnly}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {paymentMethod === 'CASH' ? (
          <div className='space-y-2 text-sm'>
            <div className='flex items-center justify-between text-muted-foreground'>
              <span>Khách đưa</span>
              <Popover open={cashPopoverOpen} onOpenChange={setCashPopoverOpen}>
                <PopoverTrigger asChild>
                  <div>
                    <Input
                      value={formatCurrency(cashReceived)}
                      onChange={(e) => onCashReceivedChange(normalizeNumber(e.target.value))}
                      onClick={() => !isReadOnly && setCashPopoverOpen(true)}
                      className='h-8 w-28 rounded-full text-right text-xs'
                      inputMode='numeric'
                      disabled={isReadOnly}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  align='end'
                  className='w-auto p-2'
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <div className='flex flex-wrap gap-1.5'>
                    {getCashPresets(totals.total).map((preset) => (
                      <Button
                        key={preset}
                        type='button'
                        variant='outline'
                        size='sm'
                        className='h-7 rounded-full px-2.5 text-xs'
                        onClick={() => {
                          onCashReceivedChange(preset)
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
                onValueChange={onBankAccountChange}
                disabled={isReadOnly || bankAccounts.length === 0}
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
        {showSaveDraft ? (
          <Button
            type='button'
            variant='outline'
            className='h-9 flex-1 rounded-xl'
            onClick={onSaveDraft}
            disabled={isSubmitting || isReadOnly || saveDraftDisabled}
          >
            Lưu nháp (F1)
          </Button>
        ) : null}
        {showSubmit ? (
          <Button
            type='button'
            className='h-9 flex-1 rounded-xl'
            onClick={onSubmit}
            disabled={isSubmitting || isReadOnly}
          >
            {submitLabel}
          </Button>
        ) : null}
        {showCancelOrder ? (
          <Button
            type='button'
            variant='destructive'
            className='h-9 flex-1 rounded-xl'
            onClick={onCancelOrder}
            disabled={isSubmitting}
          >
            Huỷ đơn hàng
          </Button>
        ) : null}
      </div>

      <Textarea
        value={notes}
        onChange={(event) => onNotesChange(event.target.value)}
        placeholder='Ghi chú đơn bán hàng'
        className='min-h-[120px] rounded-xl'
        disabled={isReadOnly}
      />
    </div>
  )
}
