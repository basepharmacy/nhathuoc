import { useMemo, useState } from 'react'
import {
  BrainCircuit,
  BarChart3,
  Warehouse,
  ShoppingCart,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SystemAssistant } from './components/system-assistant'
import { SalesPerformance } from './components/sales-performance'
import { InventoryAnalysis } from './components/inventory-analysis'
import { SmartPurchasing } from './components/smart-purchasing'

type AdvancedTab = 'assistant' | 'sales' | 'inventory' | 'purchasing'
type AdvancedPeriod = 'month' | 'quarter' | 'year'

const periodLabels: Record<AdvancedPeriod, string> = {
  month: 'Tháng',
  quarter: 'Quý',
  year: 'Năm',
}

const tabs: { value: AdvancedTab; label: string; icon: typeof BrainCircuit }[] = [
  { value: 'assistant', label: 'Trợ lý hệ thống', icon: BrainCircuit },
  { value: 'sales', label: 'Hiệu quả bán hàng', icon: BarChart3 },
  { value: 'inventory', label: 'Phân tích kho hàng', icon: Warehouse },
  { value: 'purchasing', label: 'Nhập hàng thông minh', icon: ShoppingCart },
]

function getPeriodOptions(period: AdvancedPeriod) {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const options: { value: string; label: string }[] = []

  if (period === 'month') {
    for (let y = currentYear; y >= currentYear - 3; y--) {
      const endM = y === currentYear ? currentMonth : 12
      for (let m = endM; m >= 1; m--) {
        const mm = String(m).padStart(2, '0')
        options.push({ value: `${y}-${mm}`, label: `${mm}/${y}` })
      }
    }
  } else if (period === 'quarter') {
    for (let y = currentYear; y >= currentYear - 3; y--) {
      const maxQ = y === currentYear ? Math.ceil(currentMonth / 3) : 4
      for (let q = maxQ; q >= 1; q--) {
        const sm = (q - 1) * 3 + 1
        const em = q * 3
        options.push({
          value: `${y}${String(q).padStart(2, '0')}`,
          label: `Quý ${q} ${y} (${sm}~${em})`,
        })
      }
    }
  } else {
    for (let y = currentYear; y >= currentYear - 3; y--) {
      options.push({ value: `${y}`, label: `Năm ${y}` })
    }
  }

  return options
}

export function AdvancedReport() {
  const [activeTab, setActiveTab] = useState<AdvancedTab>('assistant')
  const [period, setPeriod] = useState<AdvancedPeriod>('month')
  const periodOptions = useMemo(() => getPeriodOptions(period), [period])
  const [selectedPeriod, setSelectedPeriod] = useState(() => getPeriodOptions('month')[0]?.value)

  const handlePeriodChange = (v: AdvancedPeriod) => {
    setPeriod(v)
    const newOptions = getPeriodOptions(v)
    setSelectedPeriod(newOptions[0]?.value)
  }

  return (
    <div className='space-y-4'>
      {/* Sub-tabs + period select */}
      <div className='flex items-center justify-between gap-4'>
        <div className='inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground'>
          {tabs.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={cn(
                'inline-flex h-[calc(100%-1px)] items-center justify-center gap-1.5 rounded-md border border-transparent px-3 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow]',
                activeTab === value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className='h-3.5 w-3.5' />
              {label}
            </button>
          ))}
        </div>

        <div className='flex items-center gap-2'>
          <Select value={period} onValueChange={(v) => handlePeriodChange(v as AdvancedPeriod)}>
            <SelectTrigger className='w-28 h-9'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(periodLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className='w-44 h-9'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'assistant' && <SystemAssistant />}

      {activeTab === 'sales' && <SalesPerformance period={period} selectedPeriod={selectedPeriod} />}

      {activeTab === 'inventory' && <InventoryAnalysis />}

      {activeTab === 'purchasing' && <SmartPurchasing />}
    </div>
  )
}
