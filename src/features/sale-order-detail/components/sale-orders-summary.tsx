import { Button } from '@/components/ui/button'
import { DiscountInput } from '@/components/discount-input'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn, formatCurrency } from '@/lib/utils'
import { type PaymentMethod } from '../data/types'

type SaleOrdersSummaryProps = {
  customerName: string
  subTotalAmmount: number // Tổng tiền trước chiết khấu
  totalAmmount: number // Tổng tiền sau chiết khấu
  changeAmount?: number
  orderDiscount: number
  paymentMethod: PaymentMethod
  customerPaidAmmount: number
  notes: string
  onCancelOrder?: () => void
  isSubmitting: boolean
  isCompleted: boolean
}

const PAYMENT_METHODS: Array<{ label: string; value: PaymentMethod }> = [
  { label: 'Tiền mặt', value: 'CASH' },
  { label: 'Chuyển khoản', value: 'TRANSFER' },
]

export function SaleOrdersSummary({
  customerName,
  orderDiscount,
  paymentMethod,
  subTotalAmmount,
  totalAmmount,
  changeAmount,
  customerPaidAmmount,
  onCancelOrder,
  isSubmitting,
  isCompleted,
  notes
}: SaleOrdersSummaryProps) {

  return (
    <div className='space-y-4 rounded-xl border bg-card p-4 shadow-sm h-full'>
      <div className='text-center'>
        <div className='text-sm text-muted-foreground'>Khách hàng</div>
        <div className='text-lg font-semibold text-foreground'>{customerName}</div>
      </div>

      <Separator />

      <div className='space-y-2 text-sm'>
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Tổng tiền</span>
          <span className='font-semibold text-foreground'>
            {formatCurrency(subTotalAmmount)}đ
          </span>
        </div>
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Chiết khấu</span>
          <DiscountInput
            subtotal={subTotalAmmount}
            value={orderDiscount}
            disabled={true}
          />
        </div>
      </div>

      <Separator />

      <div className='space-y-2 text-center'>
        <div className='text-sm text-muted-foreground'>Cần thanh toán</div>
        <div className='text-3xl font-bold text-foreground'>
          {formatCurrency(totalAmmount)}đ
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
              disabled={true}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {paymentMethod === 'CASH' && (
          <div className='space-y-2 text-sm'>
            <div className='flex items-center justify-between text-muted-foreground'>
              <span>Khách đưa</span>
              <div>
                <Input
                  value={formatCurrency(customerPaidAmmount)}
                  className='h-8 w-28 rounded-full text-right text-xs'
                  inputMode='numeric'
                  disabled={true}
                />
              </div>
            </div>
            <div className='flex items-center justify-between text-muted-foreground'>
              <span>Tiền thừa</span>
              <span className='font-semibold text-foreground'>
                {formatCurrency(changeAmount)}đ
              </span>
            </div>
          </div>
        )}
      </div>

      <Separator />
      <div className='flex gap-2'>
        {isCompleted && (
          <Button
            type='button'
            variant='destructive'
            className='h-9 flex-1 rounded-xl'
            onClick={onCancelOrder}
            disabled={isSubmitting}
          >
            Huỷ đơn hàng
          </Button>
        )}
      </div>

      <Textarea
        value={notes}
        placeholder='Ghi chú đơn bán hàng'
        className='min-h-[120px] rounded-xl'
        disabled={true}
      />
    </div>
  )
}
