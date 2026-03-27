import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LocationSelector } from '@/components/location-selector'
import type { Location } from '@/services/supabase/'
import { PurchaseOrderStatus } from '@/services/supabase/'
import { statusColors, statusLabels } from '../data/types'
import { cn, toDatetimeLocal } from '@/lib/utils'

type PurchaseOrdersMetaProps = {
  locations: Location[]
  locationId: string
  onLocationChange: (locationId: string) => void
  locationDisabled?: boolean
  orderCode: string
  onOrderCodeChange: (code: string) => void
  issuedAt: string
  onIssuedAtChange: (iso: string) => void
  status: PurchaseOrderStatus
}

export function PurchaseOrdersMeta({
  locations,
  locationId,
  onLocationChange,
  locationDisabled = false,
  orderCode,
  onOrderCodeChange,
  issuedAt,
  onIssuedAtChange,
  status,
}: PurchaseOrdersMetaProps) {

  return (
    <div className='flex flex-col gap-2 rounded-xl border bg-card p-3 shadow-sm'>
      <div className='flex flex-wrap items-center gap-2 rounded-lg border bg-background p-2 text-sm'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          Chi nhánh:
          <LocationSelector
            locations={locations}
            locationId={locationId}
            onLocationChange={onLocationChange}
            disabled={locationDisabled}
          />
        </div>
        <div className='flex items-center gap-2 text-muted-foreground'>
          Đơn nhập hàng:
          <Input
            value={orderCode}
            onChange={(e) => onOrderCodeChange(e.target.value)}
            className='h-8 w-[180px] rounded-full text-sm font-medium'
            autoComplete='off'
          />
        </div>
        <div className='flex items-center gap-2 text-muted-foreground'>
          <Input
            type='datetime-local'
            value={toDatetimeLocal(issuedAt)}
            onChange={(e) => {
              const d = new Date(e.target.value)
              if (!Number.isNaN(d.getTime())) {
                onIssuedAtChange(d.toISOString())
              }
            }}
            className='h-8 w-auto rounded-full text-sm'
          />
        </div>
        <div className='ms-auto'>
          <Badge variant='outline' className={cn('text-sm font-medium', statusColors[status])}>
            {statusLabels[status]}
          </Badge>
        </div>
      </div>
    </div>
  )
}
