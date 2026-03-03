import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export type KpiItem = {
  title: string
  value: string
  icon: LucideIcon
  change?: number
  changeLabel?: string
}

export function KpiCard({ title, value, icon: Icon, change, changeLabel = 'so với tháng trước' }: KpiItem) {
  return (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <Icon className='h-4 w-4 text-muted-foreground' />
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        {change !== undefined && (
          <p className='flex items-center gap-1 text-xs text-muted-foreground'>
            {change >= 0 ? (
              <TrendingUp className='h-3 w-3 text-green-500' />
            ) : (
              <TrendingDown className='h-3 w-3 text-red-500' />
            )}
            <span className={change >= 0 ? 'text-green-500' : 'text-red-500'}>
              {change >= 0 ? '+' : ''}{change}%
            </span>
            {' '}{changeLabel}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export function KpiGrid({ items }: { items: KpiItem[] }) {
  return (
    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
      {items.map((kpi) => (
        <KpiCard key={kpi.title} {...kpi} />
      ))}
    </div>
  )
}
