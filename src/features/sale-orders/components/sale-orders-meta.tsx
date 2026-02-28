import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { Location } from '@/services/supabase/database/repo/locationsRepo'
import type { SaleOrder } from '@/services/supabase/database/repo/saleOrdersRepo'

type SaleOrdersMetaProps = {
  locations: Location[]
  locationId: string
  onLocationChange: (locationId: string) => void
  locationDisabled?: boolean
  orderCode: string
  status: SaleOrder['status']
}

const statusLabels: Record<SaleOrder['status'], string> = {
  '1_DRAFT': 'Nháp',
  '2_COMPLETE': 'Hoàn tất',
  '9_CANCELLED': 'Đã hủy',
}

const statusColors: Record<SaleOrder['status'], string> = {
  '1_DRAFT': 'bg-neutral-200/60 text-foreground border-neutral-300',
  '2_COMPLETE': 'bg-emerald-100/40 text-emerald-900 dark:text-emerald-200 border-emerald-200',
  '9_CANCELLED': 'bg-rose-200/40 text-rose-900 dark:text-rose-100 border-rose-300',
}

export function SaleOrdersMeta({
  locations,
  locationId,
  onLocationChange,
  locationDisabled = false,
  orderCode,
  status,
}: SaleOrdersMetaProps) {
  return (
    <div className='flex flex-col gap-2 rounded-xl border bg-card p-3 shadow-sm'>
      <div className='flex flex-wrap items-center gap-2 rounded-lg border bg-background p-2 text-sm'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          Chi nhánh:
          <Select value={locationId} onValueChange={onLocationChange}>
            <SelectTrigger className='h-8 min-w-[180px] rounded-full' disabled={locationDisabled}>
              <SelectValue placeholder='Chọn chi nhánh' />
            </SelectTrigger>
            <SelectContent>
              {locations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex items-center gap-2 text-muted-foreground'>
          Đơn bán hàng:
          <span className='font-medium text-foreground'>{orderCode}</span>
        </div>
        <div className='flex items-center gap-2 text-muted-foreground'>
          {new Date().toLocaleDateString('vi-VN')}{' '}
          {new Date().toLocaleTimeString('vi-VN')}
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
