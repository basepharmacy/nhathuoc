import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  QUANTITY_INPUT_PATTERN,
  formatQuantity,
  fromQtyMilli,
  parseQtyMilli,
} from '@/lib/quantity'

type QuantityStepperProps = {
  value: number
  onChange: (qty: number) => void
  disabled?: boolean
  min?: number
  onMinReached?: () => void
  /**
   * Số chữ số thập phân cho phép. Mặc định 0 = chỉ số nguyên, giữ nguyên hành vi
   * cũ cho purchase-orders / stock-adjustments / sale-order-detail.
   */
  decimals?: 0 | 3
}

export function QuantityStepper({
  value,
  onChange,
  disabled,
  min = 1,
  onMinReached,
  decimals = 0,
}: QuantityStepperProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const isDrafting = draft !== null
  const isDecimal = decimals > 0

  // Nhánh số nguyên giữ nguyên `parseInt` nguyên văn: với "3.9" thì parseInt ra 3
  // còn Math.round(parseFloat(...)) ra 4 — đổi sẽ làm lệch hành vi 3 feature kia.
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
          if (value <= min) {
            onMinReached?.()
          } else {
            onChange(Math.max(min, value - 1))
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
            onChange(base + 1)
            setDraft(null)
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            const base = draft !== null ? (parse(draft) || value) : value
            if (base > min) onChange(Math.max(min, base - 1))
            setDraft(null)
          }
        }}
        onFocus={(e) => e.target.select()}
        disabled={disabled}
        className={cn(
          'h-7 w-12 rounded-md border bg-background text-center text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50',
          // "0,333" không vừa ô rộng 12
          isDecimal && 'w-16'
        )}
      />
      <Button
        type='button'
        variant='outline'
        size='icon'
        className='h-7 w-7 rounded-full'
        disabled={disabled}
        onClick={() => onChange(value + 1)}
      >
        <Plus className='h-3 w-3' />
      </Button>
    </div>
  )
}
