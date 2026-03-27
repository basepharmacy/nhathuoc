import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import {
  type ActivityHistoryWithRelations,
  activityTypeLabels,
} from '@/services/supabase/'
import { resolveOrderRoute } from '@/lib/utils'

const activityTypeColors: Record<keyof typeof activityTypeLabels, string> = {
  PURCHASE_ORDER_ORDERED: 'bg-blue-100 text-blue-700 border-blue-200',
  PURCHASE_ORDER_STORED: 'bg-green-100 text-green-700 border-green-200',
  PURCHASE_ORDER_CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  SALE_ORDER_COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  SALE_ORDER_CANCELLED: 'bg-red-100 text-red-700 border-red-200',
  STOCK_ADJUSTMENT_CREATED: 'bg-orange-100 text-orange-700 border-orange-200',
  SUPPLIER_PAYMENT_CREATED: 'bg-purple-100 text-purple-700 border-purple-200',
  SUPPLIER_PAYMENT_DELETED: 'bg-rose-100 text-rose-700 border-rose-200',
}

const formatCurrency = (value: unknown) => {
  const num = Number(value)
  if (Number.isNaN(num)) return '—'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num)
}

const formatDateTime = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function ActivityItem({ item }: { item: ActivityHistoryWithRelations }) {
  const locationName = item.location?.name ?? 'Không xác định'
  const staffName = item.user?.name ?? 'Không xác định'
  const actionLabel = activityTypeLabels[item.activity_type]
  const referenceCode = item.reference_code
  const metadata = item.metadata as Record<string, unknown> | null
  const type = item.activity_type

  const metadataSuffix = (() => {
    if (!metadata) return null
    if (type.startsWith('PURCHASE_ORDER_') || type.startsWith('SALE_ORDER_')) {
      return ` với tổng tiền ${formatCurrency(metadata.total_amount)}, chiết khấu ${formatCurrency(metadata.discount)}`
    }
    if (type.startsWith('STOCK_ADJUSTMENT_')) {
      const parts = [`số lượng ${String(metadata.quantity ?? '—')}`]
      if (metadata.reason_code != null) {
        const reasonLabels: Record<string, string> = {
          '1_FIRST_STOCK': 'Điều chỉnh lần đầu',
          '2_DAMAGED': 'Hàng hư hỏng',
          '3_EXPIRED': 'Hàng hết hạn',
          '4_LOST': 'Hàng mất',
          '9_OTHER': 'Khác',
        }
        const reasonLabel = reasonLabels[String(metadata.reason_code)] ?? 'Không xác định'
        parts.push(`lý do ${reasonLabel}`)
      }
      if (metadata.batch_code != null) parts.push(`mã lô ${String(metadata.batch_code)}`)
      return ` với ${parts.join(', ')}`
    }
    if (type.startsWith('SUPPLIER_PAYMENT_')) {
      return ` với số tiền ${formatCurrency(metadata.amount)}`
    }
    return null
  })()

  return (
    <div className='flex flex-col gap-1 py-3 border-b last:border-b-0 px-1'>
      <div className='flex flex-wrap items-center gap-1.5 text-sm'>
        <Badge variant='outline' className='text-xs shrink-0'>
          {locationName}
        </Badge>
        {item.user?.id ? (
          <Link
            to='/staffs/$staffId'
            params={{ staffId: item.user.id }}
            className='font-medium hover:underline'
          >
            {staffName}
          </Link>
        ) : (
          <span className='font-medium'>{staffName}</span>
        )}
        <span className='text-muted-foreground'>đã thực hiện</span>
        <Badge variant='outline' className={`text-xs shrink-0 ${activityTypeColors[item.activity_type]}`}>
          {actionLabel}
        </Badge>
        {metadataSuffix && (
          <span className='text-muted-foreground'>{metadataSuffix}</span>
        )}
        {referenceCode && (() => {
          const route = resolveOrderRoute(referenceCode)
          return (
            <>
              <span className='text-muted-foreground'>. Mã tham chiếu:</span>
              {route ? (
                <Link
                  to={route.to}
                  search={route.search}
                  className='font-mono text-xs font-medium hover:underline'
                >
                  {referenceCode}
                </Link>
              ) : (
                <span className='font-mono text-xs font-medium'>{referenceCode}</span>
              )}
            </>
          )
        })()}
        <span className='text-xs text-muted-foreground ms-auto'>
          {formatDateTime(item.created_at)}
        </span>
      </div>
    </div>
  )
}
