import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SaleOrderStatus } from '@/services/supabase/'

type SaleOrdersMetaProps = {
  locationName: string
  orderCode: string
  status: SaleOrderStatus
  issuedAt: string
}

const statusLabels: Record<SaleOrderStatus, string> = {
  '1_DRAFT': 'Nháp',
  '2_COMPLETE': 'Hoàn tất',
  '7_DAV_ERROR': 'Lỗi DAV',
  '8_INSUFFICIENT_STOCK': 'Thiếu tồn kho',
  '9_CANCELLED': 'Đã hủy',
}

const statusColors: Record<SaleOrderStatus, string> = {
  '1_DRAFT': 'bg-neutral-200/60 text-foreground border-neutral-300',
  '2_COMPLETE': 'bg-emerald-100/40 text-emerald-900 dark:text-emerald-200 border-emerald-200',
  '7_DAV_ERROR': 'bg-yellow-100/40 text-yellow-900 dark:text-yellow-200 border-yellow-200',
  '8_INSUFFICIENT_STOCK': 'bg-orange-100/40 text-orange-900 dark:text-orange-200 border-orange-200',
  '9_CANCELLED': 'bg-rose-200/40 text-rose-900 dark:text-rose-100 border-rose-300',
}

export function SaleOrdersMeta({
  locationName,
  orderCode,
  status,
  issuedAt,
}: SaleOrdersMetaProps) {
  return (
    <div className='flex flex-col gap-2 rounded-xl border bg-card p-3 shadow-sm'>
      <div className='flex flex-wrap items-center gap-2 rounded-lg border bg-background p-2 text-sm'>
        <div className='flex items-center gap-2 text-muted-foreground'>
          Chi nhánh:
          <span className='font-medium text-foreground'>{locationName}</span>
        </div>
        <div className='flex items-center gap-2 text-muted-foreground'>
          Đơn bán hàng:
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
