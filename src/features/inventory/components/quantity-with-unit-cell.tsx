import { useMemo, useState } from 'react'
import { formatQuantity } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type UnitInfo = {
  unit_name: string
  is_base_unit: boolean
  conversion_factor: number
}

export function QuantityWithUnitCell({ value, units }: { value: number; units: UnitInfo[] }) {
  const baseUnit = units.find((u) => u.is_base_unit)
  const [selectedUnit, setSelectedUnit] = useState(baseUnit?.unit_name ?? '')

  const displayValue = useMemo(() => {
    const unit = units.find((u) => u.unit_name === selectedUnit)
    if (!unit || unit.is_base_unit) return value
    return value / unit.conversion_factor
  }, [value, selectedUnit, units])

  return (
    <span className='inline-flex items-center gap-1 tabular-nums'>
      {formatQuantity(displayValue)}
      <Select value={selectedUnit} onValueChange={setSelectedUnit}>
        <SelectTrigger className='h-6 w-auto gap-1 border-none px-1 py-0 text-xs shadow-none'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {units.map((u) => (
            <SelectItem key={u.unit_name} value={u.unit_name}>
              {u.unit_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </span>
  )
}
