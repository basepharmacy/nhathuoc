import { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DatePickerProps = {
  selected: Date | undefined
  onSelect: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  fromYear?: number
  toYear?: number
  disablePastDates?: boolean
}

export function DatePicker({
  selected,
  onSelect,
  placeholder = 'Chọn ngày',
  className,
  disabled = false,
  fromYear,
  toYear,
  disablePastDates = true,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const currentYear = new Date().getFullYear()
  const resolvedFromYear = fromYear ?? (disablePastDates ? currentYear : currentYear - 10)
  const resolvedToYear = toYear ?? currentYear + 100
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          data-empty={!selected}
          disabled={disabled}
          className={
            className ??
            'w-[240px] justify-start text-start font-normal data-[empty=true]:text-muted-foreground'
          }
        >
          {selected ? (
            format(selected, 'dd/MM/yyyy', { locale: vi })
          ) : (
            <span>{placeholder}</span>
          )}
          <CalendarIcon className='ms-auto h-4 w-4 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          mode='single'
          captionLayout='dropdown'
          locale={vi}
          fromYear={resolvedFromYear}
          toYear={resolvedToYear}
          selected={selected}
          onSelect={onSelect}
          disabled={(date: Date) => {
            if (disabled) return true
            const target = new Date(date)
            target.setHours(0, 0, 0, 0)
            if (disablePastDates) {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              if (target < today) return true
            }
            return target.getFullYear() > resolvedToYear || target.getFullYear() < resolvedFromYear
          }}
        />
        {selected && (
          <div className='border-t p-2'>
            <Button
              variant='ghost'
              size='sm'
              className='w-full text-muted-foreground'
              onClick={() => {
                onSelect(undefined)
                setOpen(false)
              }}
            >
              Xóa ngày
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
