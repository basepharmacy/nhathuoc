import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'

type PercentInputProps = {
  /** % hiện tại, được tính ngược từ số tiền ở component cha */
  value: number
  /** Gọi ngay mỗi lần gõ (live) với % đã kẹp trong khoảng 0-100 */
  onChange: (percent: number) => void
  /** Gọi khi nhấn Enter — dùng để đóng popover */
  onEnter?: () => void
  disabled?: boolean
  className?: string
}

const MAX_PERCENT = 100

export function PercentInput({
  value,
  onChange,
  onEnter,
  disabled,
  className,
}: PercentInputProps) {
  const [draft, setDraft] = useState<string | null>(null)

  return (
    <div className='relative'>
      <Input
        type='text'
        inputMode='numeric'
        value={draft ?? String(value)}
        onChange={(e) => {
          if (disabled) return
          const digits = e.target.value.replace(/[^0-9]/g, '').slice(0, 3)
          if (digits === '') {
            // Cho phép ô rỗng khi đang gõ, chưa áp dụng để giá không nhảy
            setDraft('')
            return
          }
          const percent = Math.min(MAX_PERCENT, parseInt(digits, 10))
          setDraft(String(percent))
          onChange(percent)
        }}
        onFocus={(e) => e.target.select()}
        onBlur={() => setDraft(null)}
        onKeyDown={(e) => {
          if (disabled) return
          if (e.key === 'Enter') {
            e.preventDefault()
            setDraft(null)
            onEnter?.()
          } else if (e.key === 'Escape') {
            e.preventDefault()
            setDraft(null)
            e.currentTarget.blur()
          }
        }}
        disabled={disabled}
        className={cn(
          'h-7 w-16 rounded-full pr-6 text-right text-xs',
          className
        )}
      />
      <span className='pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-muted-foreground'>
        %
      </span>
    </div>
  )
}
