import { useMemo } from 'react'
import { format } from 'date-fns'
import { DatePicker } from '@/components/date-picker'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TimePeriod } from '../../..'
import {
  type SelectablePeriod,
  getPeriodOptions,
  getWeekLabel,
  parseReferenceDate,
  periodValueToReferenceDate,
  referenceDateToPeriodValue,
} from '../../../lib/period-options'

type ReportPeriodPickerProps = {
  timePeriod: TimePeriod
  referenceDate: string
  onChange: (referenceDate: string) => void
}

const datePickerClassName =
  'w-48 h-9 text-sm justify-start text-start font-normal data-[empty=true]:text-muted-foreground'

export function ReportPeriodPicker({
  timePeriod,
  referenceDate,
  onChange,
}: ReportPeriodPickerProps) {
  const fromYear = new Date().getFullYear() - 3

  if (timePeriod === 'day' || timePeriod === 'week') {
    const selected = parseReferenceDate(referenceDate)
    return (
      <DatePicker
        selected={selected}
        onSelect={(date) => {
          if (date) onChange(format(date, 'yyyy-MM-dd'))
        }}
        disablePastDates={false}
        fromYear={fromYear}
        displayLabel={timePeriod === 'week' ? getWeekLabel(selected) : undefined}
        className={datePickerClassName}
      />
    )
  }

  return (
    <PeriodSelect
      period={timePeriod}
      referenceDate={referenceDate}
      onChange={onChange}
    />
  )
}

function PeriodSelect({
  period,
  referenceDate,
  onChange,
}: {
  period: SelectablePeriod
  referenceDate: string
  onChange: (referenceDate: string) => void
}) {
  const options = useMemo(() => getPeriodOptions(period), [period])
  const value = referenceDateToPeriodValue(period, referenceDate)

  return (
    <Select
      value={value}
      onValueChange={(v) => onChange(periodValueToReferenceDate(period, v))}
    >
      <SelectTrigger className='w-44 h-9'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
