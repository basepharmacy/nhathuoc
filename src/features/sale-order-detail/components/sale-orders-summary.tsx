import { useCallback, useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { saleOrdersRepo } from '@/client'
import { Button } from '@/components/ui/button'
import { DiscountInput } from '@/components/discount-input'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { cn, formatCurrency, normalizeNumber } from '@/lib/utils'
import { type PaymentMethod } from '../data/types'
import { SaleOrderWithRelations, type BankAccount } from '@/services/supabase/'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { bankByBin } from '@/components/bank-combobox'

type SaleOrdersSummaryProps = {
  order: SaleOrderWithRelations
  bankId: string
  setBankId: (value: string) => void
  bankAccounts: BankAccount[]
  onCancelOrder?: () => void
  isSubmitting: boolean
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
  order,
  onCancelOrder,
  isSubmitting,
  bankId,
  setBankId,
  bankAccounts,
}: SaleOrdersSummaryProps) {
  const [cashPopoverOpen, setCashPopoverOpen] = useState(false)
  const [customerPaid, setCustomerPaid] = useState(order.customer_paid_amount ?? 0)
  const [totalAmmount, setTotalAmmount] = useState(order.total_amount ?? 0)
  const [discount, setDiscount] = useState(order.discount ?? 0)
  const [notes, setNotes] = useState(order.notes ?? '')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    order.customer_paid_amount ? 'CASH' : 'TRANSFER'
  )
  const [isEditing, setIsEditing] = useState(false)
  const customerName = order.customer?.name ?? 'Khách lẻ'
  const subtotalAmmount = order.total_amount + order.discount
  const changeAmount = Math.max(customerPaid - totalAmmount, 0)
  const isCompleted = order.status === '2_COMPLETE'
  useEffect(() => {
    setTotalAmmount(subtotalAmmount - discount)
  }, [discount])

  const cancelEdit = useCallback(() => {
    setIsEditing(false)
    setCustomerPaid(order.customer_paid_amount ?? 0)
    setTotalAmmount(order.total_amount ?? 0)
    setDiscount(order.discount ?? 0)
    setNotes(order.notes ?? '')
    setPaymentMethod(order.customer_paid_amount ? 'CASH' : 'TRANSFER')
  }, [order, setBankId])

  const queryClient = useQueryClient()
  const updateMutation = useMutation({
    mutationFn: async () => {
      return saleOrdersRepo.updateSaleOrder({
        orderId: order.id,
        order: {
          customer_id: order.customer_id ?? null,
          status: order.status,
          customer_paid_amount: paymentMethod === 'CASH' ? customerPaid : 0,
          discount,
          total_amount: totalAmmount,
          notes: notes.trim().length > 0 ? notes.trim() : null,
        },
      })
    },
    onSuccess: () => {
      toast.success('Cập nhật đơn hàng thành công')
      queryClient.invalidateQueries({ queryKey: ["sale-orders", order.tenant_id, "detail-with-relations", order.id] })
      setIsEditing(false)
    },
    onError: (error) => {
      toast.error('Cập nhật đơn hàng thất bại', {
        description: error.message,
      })
    },
  })



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
            {formatCurrency(subtotalAmmount)}đ
          </span>
        </div>
        <div className='flex items-center justify-between text-muted-foreground'>
          <span>Chiết khấu</span>
          <DiscountInput
            subtotal={subtotalAmmount}
            value={discount}
            onChange={setDiscount}
            disabled={!isEditing}
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
          {PAYMENT_METHODS.map((option) => {
            const activeMethod = paymentMethod
            return (
              <Button
                key={option.value}
                type='button'
                variant={activeMethod === option.value ? 'default' : 'outline'}
                className={cn(
                  'h-auto min-h-10 w-full rounded-full px-2 py-2 text-xs leading-4 whitespace-normal',
                  activeMethod !== option.value && 'text-muted-foreground'
                )}
                onClick={() => setPaymentMethod(option.value)}
              >
                {option.label}
              </Button>
            )
          })}
        </div>

        {paymentMethod === 'CASH' ? (
          <div className='space-y-2 text-sm'>
            <div className='flex items-center justify-between text-muted-foreground'>
              <span>Khách đưa</span>
              <Popover open={isEditing && cashPopoverOpen} onOpenChange={setCashPopoverOpen}>
                <PopoverTrigger asChild>
                  <div>
                    <Input
                      value={formatCurrency(customerPaid)}
                      onChange={(e) => setCustomerPaid(normalizeNumber(e.target.value))}
                      onClick={isEditing ? () => setCashPopoverOpen(true) : undefined}
                      className='h-8 w-28 rounded-full text-right text-xs'
                      inputMode='numeric'
                      disabled={!isEditing}
                    />
                  </div>
                </PopoverTrigger>
                <PopoverContent
                  align='end'
                  className='w-auto p-2'
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <div className='flex flex-wrap gap-1.5'>
                    {getCashPresets(totalAmmount).map((preset) => (
                      <Button
                        key={preset}
                        type='button'
                        variant='outline'
                        size='sm'
                        className='h-7 rounded-full px-2.5 text-xs'
                        onClick={() => {
                          setCustomerPaid(preset)
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
                value={bankId}
                onValueChange={setBankId}
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
        {isCompleted && (
          <>
            {isEditing ? (
              <Button
                type='button'
                variant='outline'
                className='h-9 flex-1 rounded-xl'
                onClick={cancelEdit}
              >
                Huỷ chỉnh sửa
              </Button>
            ) : (
              <Button
                type='button'
                variant='destructive'
                className='h-9 flex-1 rounded-xl'
                onClick={onCancelOrder}
                disabled={isSubmitting || isEditing}
              >
                Huỷ đơn hàng
              </Button>
            )}
            <Button
              type='button'
              variant={isEditing ? 'default' : 'outline'}
              className='h-9 flex-1 rounded-xl'
              onClick={isEditing ? () => updateMutation.mutate() : () => setIsEditing(true)}
              disabled={isSubmitting || updateMutation.isPending}
            >
              {isEditing ? (updateMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật') : 'Chỉnh sửa'}
            </Button>
          </>
        )}
      </div>

      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder='Ghi chú đơn bán hàng'
        className='min-h-[120px] rounded-xl'
        disabled={!isEditing}
      />
    </div>
  )
}
