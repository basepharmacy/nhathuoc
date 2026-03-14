import { LocationSelector } from '@/components/location-selector'
import type { Location } from '@/services/supabase/database/repo/locationsRepo'

type StockAdjustmentsAddMetaProps = {
  locations: Location[]
  locationId: string
  onLocationChange: (locationId: string) => void
  locationDisabled?: boolean
}

export function StockAdjustmentsAddMeta({
  locations,
  locationId,
  onLocationChange,
  locationDisabled = false,
}: StockAdjustmentsAddMetaProps) {
  return (
    <div className='flex flex-col gap-2 rounded-xl border bg-card p-3 shadow-sm'>
      <div className='flex flex-wrap items-center gap-4 rounded-lg border bg-background p-2 text-sm'>
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
          {new Date().toLocaleDateString('vi-VN')}{' '}
          {new Date().toLocaleTimeString('vi-VN')}
        </div>
      </div>
    </div>
  )
}
