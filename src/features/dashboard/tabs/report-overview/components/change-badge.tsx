import { Badge } from '@/components/ui/badge'
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react'

export function ChangeBadge({ value, label }: { value: number; label: string }) {
  const isUp = value >= 0
  return (
    <Badge
      variant='outline'
      className={
        isUp
          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
          : 'border-rose-200 bg-rose-50 text-rose-700'
      }
    >
      {isUp ? <TrendingUpIcon className='h-3 w-3' /> : <TrendingDownIcon className='h-3 w-3' />}
      {isUp ? '+' : ''}
      {value}% {label}
    </Badge>
  )
}
