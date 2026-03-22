import { Badge } from '@/components/ui/badge'
import type { PurchaseOrderStatus } from '@/services/supabase/'
import { statusColors, statusLabels } from '@/features/purchase-orders/data/types'
import { cn } from '@/lib/utils'

type PurchaseOrderDetailMetaProps = {
  locationName?: string
  orderCode: string
  status: PurchaseOrderStatus
  issuedAt: string
}

export function PurchaseOrderDetailMeta({
  locationName,
  orderCode,
  status,
  issuedAt
}: PurchaseOrderDetailMetaProps) {
  return (
    <div className='flex flex-col gap-2 rounded-xl border bg-card p-3 shadow-sm'>
      <div className='flex flex-wrap items-center gap-3 rounded-lg border bg-background p-2 text-sm'>
        {locationName && (
          <div className='flex items-center gap-2 text-muted-foreground'>
            Chi nhánh:
            <span className='font-medium text-foreground'>{locationName}</span>
          </div>
        )}
        <div className='flex items-center gap-2 text-muted-foreground'>
          Đơn nhập hàng:
          <span className='font-medium text-foreground'>{orderCode}</span>
        </div>
        <div className='flex items-center gap-2 text-muted-foreground'>
          {new Date(issuedAt).toLocaleDateString('vi-VN')}{' '}
          {new Date(issuedAt).toLocaleTimeString('vi-VN')}
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
