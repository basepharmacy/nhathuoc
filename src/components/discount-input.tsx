import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatCurrency, normalizeNumber } from '@/lib/utils'

const DISCOUNT_PRESETS = [5, 10, 15, 20, 25, 50, 75]

type DiscountInputProps = {
  subtotal: number
  value: number
  onChange: (value: number) => void
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className='flex items-center gap-1.5'>
          {value > 0 && (
            <span className='text-xs font-medium text-red-500'>
              -{percent}%
            </span>
          )}
          <Input
            ref={inputRef}
            value={formatCurrency(value)}
            onChange={(e) => onChange(normalizeNumber(e.target.value))}
            onClick={() => !disabled && setOpen(true)}
            className='h-8 w-28 rounded-full text-right text-xs'
            inputMode='numeric'
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
                onChange(Math.round((subtotal * p) / 100))
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
