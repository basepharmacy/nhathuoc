import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { LocationSelector } from '@/components/location-selector'
import { cn } from '@/lib/utils'
import type { Location } from '@/services/supabase/database/repo/locationsRepo'
import type { PurchaseOrder } from '@/services/supabase/database/repo/purchaseOrdersRepo'

type PurchaseOrdersMetaProps = {
  locations: Location[]
  locationId: string
  onLocationChange: (locationId: string) => void
  locationDisabled?: boolean
  orderCode: string
  onOrderCodeChange?: (code: string) => void
  issuedAt?: string
  onIssuedAtChange?: (iso: string) => void
  isEdit?: boolean
  status: PurchaseOrder['status']
}

const statusLabels: Record<PurchaseOrder['status'], string> = {
  '1_DRAFT': 'Nháp',
  '2_ORDERED': 'Đã đặt',
  '3_CHECKING': 'Đang kiểm',
  '4_STORED': 'Đã nhập kho',
  '9_CANCELLED': 'Đã hủy',
}

const statusColors: Record<PurchaseOrder['status'], string> = {
  '1_DRAFT': 'bg-neutral-200/60 text-foreground border-neutral-300',
  '2_ORDERED': 'bg-blue-100/40 text-blue-900 dark:text-blue-200 border-blue-200',
  '3_CHECKING': 'bg-amber-200/40 text-amber-900 dark:text-amber-100 border-amber-300',
  '4_STORED': 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200',
  '9_CANCELLED': 'bg-rose-200/40 text-rose-900 dark:text-rose-100 border-rose-300',
}

const toDatetimeLocal = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const formatDateTimeVN = (iso: string) => {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.toLocaleDateString('vi-VN')} ${d.toLocaleTimeString('vi-VN')}`
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
  isEdit = false,
  status,
}: PurchaseOrdersMetaProps) {
  const editable = !isEdit

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
          {editable && onOrderCodeChange ? (
            <Input
              value={orderCode}
              onChange={(e) => onOrderCodeChange(e.target.value)}
              className='h-8 w-[180px] rounded-full text-sm font-medium'
              autoComplete='off'
            />
          ) : (
            <span className='font-medium text-foreground'>{orderCode}</span>
          )}
        </div>
        <div className='flex items-center gap-2 text-muted-foreground'>
          {editable && onIssuedAtChange && issuedAt ? (
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
          ) : (
            <span>{issuedAt ? formatDateTimeVN(issuedAt) : `${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}`}</span>
          )}
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
