import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  QUANTITY_INPUT_PATTERN,
  formatQuantity,
  fromQtyMilli,
  parseQtyMilli,
  roundQuantity,
} from '@/lib/quantity'

type QuantityStepperProps = {
  value: number
  onChange: (qty: number) => void
  disabled?: boolean
  min?: number
  onMinReached?: () => void
  /**
   * Số chữ số thập phân cho phép. Mặc định 3 vì bán hàng và điều chỉnh kho đều
   * nhận số lẻ; chỉ nhập hàng truyền `decimals={0}` vì
   * `purchase_order_items.quantity` vẫn là integer (nhập từ NCC luôn nguyên kiện)
   * và Postgres sẽ làm tròn im lặng nếu lọt số lẻ xuống.
   */
  decimals?: 0 | 3
}

export function QuantityStepper({
  value,
  onChange,
  disabled,
  min = 1,
  onMinReached,
  decimals = 3,
}: QuantityStepperProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const isDrafting = draft !== null
  const isDecimal = decimals > 0

  // Nhánh số nguyên giữ nguyên `parseInt` nguyên văn: với "3.9" thì parseInt ra 3
  // còn Math.round(parseFloat(...)) ra 4 — đổi sẽ làm lệch hành vi nhập hàng.
  const parse = (raw: string): number => {
    if (!isDecimal) return parseInt(raw, 10)
    const milli = parseQtyMilli(raw)
    return milli === null ? NaN : fromQtyMilli(milli)
  }

  const commit = () => {
    if (draft === null) return
    const parsed = parse(draft)
    onChange(Number.isNaN(parsed) || parsed < min ? value : parsed)
    setDraft(null)
  }

  return (
    <div className='flex items-center justify-center gap-0.5'>
      <Button
        type='button'
        variant='outline'
        size='icon'
        className='h-7 w-7 rounded-full'
        disabled={disabled}
        onClick={() => {
          // roundQuantity vì `1.333 - 1` trong JS ra 0.33299999999999996. Giá trị
          // đó đi thẳng vào nháp localStorage và lên RPC, bị trả INVALID_QUANTITY;
          // nếu đang offline thì mutation hỏng bị xoá khỏi hàng đợi → mất đơn.
          const next = roundQuantity(value - 1)
          if (value <= min || next < min) {
            onMinReached?.()
          } else {
            onChange(next)
          }
        }}
      >
        <Minus className='h-3 w-3' />
      </Button>
      <input
        type='text'
        inputMode={isDecimal ? 'decimal' : 'numeric'}
        value={isDrafting ? draft : isDecimal ? formatQuantity(value) : value}
        onChange={(e) => {
          if (disabled) return
          // Chặn ngay lúc gõ để không nhập quá 3 chữ số thập phân.
          if (isDecimal && !QUANTITY_INPUT_PATTERN.test(e.target.value)) return
          setDraft(e.target.value)
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (disabled) return
          if (e.key === 'Enter') {
            commit()
            e.currentTarget.blur()
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault()
            const base = draft !== null ? (parse(draft) || value) : value
            onChange(roundQuantity(base + 1))
            setDraft(null)
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            const base = draft !== null ? (parse(draft) || value) : value
            const next = roundQuantity(base - 1)
            if (next >= min) onChange(next)
            setDraft(null)
          }
        }}
        onFocus={(e) => e.target.select()}
        disabled={disabled}
        className={cn(
          'h-7 w-16 rounded-md border bg-background text-center text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50',
          // "0,333" không vừa ô rộng 12; nhánh số nguyên không cần rộng thế
          !isDecimal && 'w-12'
        )}
      />
      <Button
        type='button'
        variant='outline'
        size='icon'
        className='h-7 w-7 rounded-full'
        disabled={disabled}
        onClick={() => onChange(roundQuantity(value + 1))}
      >
        <Plus className='h-3 w-3' />
      </Button>
    </div>
  )
}
