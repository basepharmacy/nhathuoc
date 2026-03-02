import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

type QuantityStepperProps = {
  value: number
  onChange: (qty: number) => void
  disabled?: boolean
  min?: number
}

export function QuantityStepper({
  value,
  onChange,
  disabled,
  min = 1,
}: QuantityStepperProps) {
  const [draft, setDraft] = useState<string | null>(null)
  const isDrafting = draft !== null

  const commit = () => {
    if (draft === null) return
    const parsed = parseInt(draft, 10)
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
        disabled={disabled || value <= min}
        onClick={() => onChange(value - 1)}
      >
        <Minus className='h-3 w-3' />
      </Button>
      <input
        type='text'
        inputMode='numeric'
        value={isDrafting ? draft : value}
        onChange={(e) => {
          if (disabled) return
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
            const base = draft !== null ? (parseInt(draft, 10) || value) : value
            onChange(base + 1)
            setDraft(null)
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            const base = draft !== null ? (parseInt(draft, 10) || value) : value
            if (base > min) onChange(base - 1)
            setDraft(null)
          }
        }}
        onFocus={(e) => e.target.select()}
        disabled={disabled}
        className='h-7 w-12 rounded-md border bg-background text-center text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50'
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
