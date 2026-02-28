import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { formatCurrency, normalizeNumber } from '../data/utils'
import { type PaymentMethod } from '../data/types'
import type { Customer } from '@/services/supabase/database/repo/customersRepo'
import type { SaleOrder } from '@/services/supabase/database/repo/saleOrdersRepo'
import { CustomerSwitcher } from './customer-switcher'

type SaleOrdersSummaryProps = {
  customers: Customer[]
  customerId: string
  onCustomerChange: (customerId: string) => void
  onAddCustomer?: () => void
  totals: {
    subtotal: number
    total: number
  }
  orderDiscount: number
  onOrderDiscountChange: (value: number) => void
  paymentMethod: PaymentMethod
  onPaymentMethodChange: (value: PaymentMethod) => void
  paidAmount: number
  onPaidAmountChange: (value: number) => void
  cashReceived: number
  onCashReceivedChange: (value: number) => void
  changeAmount: number
  debtAmount: number
  notes: string
  onNotesChange: (value: string) => void
  onSaveDraft: () => void
  onSubmit: () => void
  isSubmitting: boolean
  orderStatus: SaleOrder['status']
}

const PAYMENT_METHODS: Array<{ label: string; value: PaymentMethod }> = [
  { label: 'Tiền mặt', value: 'CASH' },
  { label: 'Chuyển khoản', value: 'TRANSFER' },
]

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
  paidAmount,
  onPaidAmountChange,
  cashReceived,
  onCashReceivedChange,
  changeAmount,
  debtAmount,
  notes,
  onNotesChange,
  onSaveDraft,
  onSubmit,
  isSubmitting,
  orderStatus,
}: SaleOrdersSummaryProps) {
  const isDraft = orderStatus === '1_DRAFT'
  const isComplete = orderStatus === '2_COMPLETE'
  const isEditable = isDraft
  const isReadOnly = !isEditable
  const submitLabel = isComplete ? 'Đã hoàn tất' : 'Hoàn tất (F9)'
  const showSaveDraft = isDraft
  const saveDraftDisabled = !isDraft
  const customerDisabled = !isDraft
  const showSubmit = isEditable

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
          <Input
            value={orderDiscount}
            onChange={(event) => onOrderDiscountChange(normalizeNumber(event.target.value))}
            className='h-8 w-28 rounded-full text-right text-xs'
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
              <Input
                value={cashReceived}
                onChange={(event) => onCashReceivedChange(normalizeNumber(event.target.value))}
                className='h-8 w-28 rounded-full text-right text-xs'
                disabled={isReadOnly}
              />
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
            <div className='flex items-center justify-between text-muted-foreground'>
              <span>Số tiền thanh toán</span>
              <Input
                value={paidAmount}
                onChange={(event) => onPaidAmountChange(normalizeNumber(event.target.value))}
                className='h-8 w-28 rounded-full text-right text-xs'
                disabled={isReadOnly}
              />
            </div>
            <div className='flex items-center justify-between text-muted-foreground'>
              <span>Còn lại</span>
              <span className='font-semibold text-foreground'>
                {formatCurrency(debtAmount)}đ
              </span>
            </div>
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
