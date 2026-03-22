import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CurrencyInput } from '@/components/ui/currency-input'

const DISCOUNT_PRESETS = [5, 10, 15, 20, 25, 50, 75]

export function UnitPriceInput({
  originalPrice,
  value,
  onChange,
  disabled,
  forceOpen,
  onOpenChange,
}: {
  originalPrice: number
  value: number
  onChange: (value: number) => void
  disabled?: boolean
  forceOpen?: boolean
  onOpenChange?: (open: boolean) => void
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (forceOpen) setOpen(true)
  }, [forceOpen])

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    onOpenChange?.(next)
  }

  const discountPercent =
    originalPrice > 0
      ? Math.round(((originalPrice - value) / originalPrice) * 10000) / 100
      : 0

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className='flex items-center gap-1.5'>
          {discountPercent > 0 && (
            <span className='text-xs font-medium text-red-500 shrink-0'>
              -{discountPercent}%
            </span>
          )}
          <CurrencyInput
            value={value}
            onValueChange={onChange}
            onClick={() => !disabled && handleOpenChange(true)}
            className='h-8 w-full rounded-full text-end text-xs'
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
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='h-7 rounded-full px-2.5 text-xs'
            onClick={() => {
              onChange(originalPrice)
              handleOpenChange(false)
            }}
          >
            Giá gốc
          </Button>
          {DISCOUNT_PRESETS.map((p) => (
            <Button
              key={p}
              type='button'
              variant='outline'
              size='sm'
              className='h-7 rounded-full px-2.5 text-xs'
              onClick={() => {
                onChange(Math.round(originalPrice * (1 - p / 100)))
                handleOpenChange(false)
              }}
            >
              -{p}%
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
