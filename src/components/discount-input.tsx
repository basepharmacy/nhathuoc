import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CurrencyInput } from '@/components/ui/currency-input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

const DISCOUNT_PRESETS = [5, 10, 15, 20, 25, 50, 75]

type DiscountInputProps = {
  subtotal: number
  value: number
  onChange?: (value: number) => void
  disabled?: boolean
}

export function DiscountInput({
  subtotal,
  value,
  onChange,
  disabled,
}: DiscountInputProps) {
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const percent =
    subtotal > 0 ? Math.round((value / subtotal) * 10000) / 100 : 0

  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className='flex items-center gap-1.5'>
          {value > 0 && (
            <span className='text-xs font-medium text-red-500'>
              -{percent}%
            </span>
          )}
          <CurrencyInput
            ref={inputRef}
            value={value}
            onValueChange={(v) => onChange?.(v)}
            onClick={() => !disabled && setOpen(true)}
            className='h-8 w-28 rounded-full text-right text-xs'
            disabled={disabled}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className='w-auto p-2'
        align='end'
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className='flex flex-wrap gap-1.5'>
          {DISCOUNT_PRESETS.map((p) => (
            <Button
              key={p}
              type='button'
              variant='outline'
              size='sm'
              className='h-7 rounded-full px-2.5 text-xs'
              onClick={() => {
                onChange?.(Math.round((subtotal * p) / 100))
                setOpen(false)
              }}
            >
              {p}%
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
