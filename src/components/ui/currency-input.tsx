import * as React from 'react'
import { Input } from '@/components/ui/input'
import { formatCurrency, normalizeNumber } from '@/lib/utils'

type CurrencyInputProps = Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'> & {
  value: number
  onValueChange: (value: number) => void
  step?: number
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, step = 1000, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        onValueChange(value + step)
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        onValueChange(Math.max(0, value - step))
      } else if (e.key === 'Escape') {
        e.preventDefault()
        ;(e.target as HTMLInputElement).blur()
      }
      onKeyDown?.(e)
    }

    return (
      <Input
        ref={ref}
        data-currency-input
        value={formatCurrency(value)}
        onChange={(e) => onValueChange(normalizeNumber(e.target.value))}
        onKeyDown={handleKeyDown}
        inputMode='numeric'
        {...props}
      />
    )
  }
)
CurrencyInput.displayName = 'CurrencyInput'

export { CurrencyInput }
