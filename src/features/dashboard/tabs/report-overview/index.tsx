import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDateLabel, formatQuantity } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { useUser } from '@/client/provider'
import { useLocationContext } from '@/context/location-provider'
import {
  getExpiredInventoryBatchesQueryOptions,
  getLowStockProductsQueryOptions,
  getSalesStatisticsQueryOptions,
} from '@/client/queries'
import {
  AlertTriangle,
  CalendarX,
  DollarSign,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react'
import type { TimePeriod } from '../..'
import { ChangeBadge } from './components/change-badge'

const emptyMetrics = {
  revenue: 0,
  profit: 0,
  orders: 0,
  stockLossAmount: 0,
  revenueChange: 0,
  profitChange: 0,
  ordersChange: 0,
  stockLossChange: 0,
}

const periodDescriptions: Record<TimePeriod, string> = {
  day: 'Theo hôm nay',
  week: 'Theo tuần này',
  month: 'Theo tháng này',
  quarter: 'Theo quý này',
  year: 'Theo năm nay',
}

export function ReportOverview({ timePeriod }: { timePeriod: TimePeriod }) {
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()
  const locationId = selectedLocationId ?? user?.location?.id ?? undefined
  const tenantId = user?.profile?.tenant_id ?? ''

  const { data: reportMetrics } = useQuery({
    ...getSalesStatisticsQueryOptions({
      period: timePeriod,
      locationId,
    }),
    enabled: !!user,
  })

  const { data: stockAlerts = [] } = useQuery({
    ...getLowStockProductsQueryOptions({ locationId }),
    enabled: !!user,
  })

  const { data: expiredBatches = [] } = useQuery({
    ...getExpiredInventoryBatchesQueryOptions({
      tenantId,
      locationId,
      limit: 5,
    }),
    enabled: !!tenantId,
  })

  const data = reportMetrics ?? emptyMetrics
  const periodDescription = periodDescriptions[timePeriod]
  const changeLabel = `so với ${timePeriod === 'day'
    ? 'hôm qua'
    : timePeriod === 'week'
      ? 'tuần trước'
      : timePeriod === 'month'
        ? 'tháng trước'
        : timePeriod === 'quarter'
          ? 'quý trước'
          : 'năm trước'}`

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Doanh thu</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(data.revenue, { style: 'currency' })}
            </div>
            <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
              <span>{periodDescription}</span>
              <ChangeBadge value={data.revenueChange} label={changeLabel} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Lợi nhuận</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(data.profit, { style: 'currency' })}
            </div>
            <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
              <span>{periodDescription}</span>
              <ChangeBadge value={data.profitChange} label={changeLabel} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Số đơn bán</CardTitle>
            <ShoppingCart className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatQuantity(data.orders)}</div>
            <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
              <span>{periodDescription}</span>
              <ChangeBadge value={data.ordersChange} label={changeLabel} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Tiền thất thoát</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatCurrency(data.stockLossAmount, { style: 'currency' })}
            </div>
            <div className='flex flex-wrap items-center gap-2 text-xs text-muted-foreground'>
              <span>{periodDescription}</span>
              <ChangeBadge value={data.stockLossChange} label={changeLabel} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 lg:grid-cols-2'>
        <Card
          className={
            expiredBatches.length
              ? 'border-rose-200/80 bg-rose-50/30 shadow-sm'
              : undefined
          }
        >
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CalendarX className='h-4 w-4 text-rose-600' />
              Danh sách lô đã hết hạn
            </CardTitle>
            <CardDescription>Những lô cần xử lý ngay.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {expiredBatches.map((batch) => (
                <div key={batch.id} className='space-y-1 rounded-lg border border-transparent bg-muted/40 px-3 py-2'>
                  <div className='flex items-center justify-between gap-3'>
                    <p className='text-sm font-medium'>{batch.name}</p>
                    <Badge variant='destructive'>Hết hạn</Badge>
                  </div>
                  <div className='flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground'>
                    <span>Lô: {batch.batch}</span>
                    <span>HSD: {formatDateLabel(batch.expiredAt)}</span>
                    <span>
                      Còn {formatQuantity(batch.quantity)} {batch.unitName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card
          className={
            stockAlerts.length
              ? 'border-amber-200/80 bg-amber-50/30 shadow-sm'
              : undefined
          }
        >
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-4 w-4 text-amber-600' />
              Cảnh báo tồn kho
            </CardTitle>
            <CardDescription>Danh sách sản phẩm hết hoặc sắp hết hàng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {stockAlerts.map((item, index) => (
                <div key={`${item.name}-${item.status}-${index}`} className='flex items-center justify-between gap-3'>
                  <div>
                    <p className='text-sm font-medium'>{item.name}</p>
                    <p className='text-xs text-muted-foreground'>
                      Còn {formatQuantity(item.stock)} {item.unitName}
                    </p>
                  </div>
                  <Badge variant={item.status === 'out' ? 'destructive' : 'secondary'}>
                    {item.status === 'out' ? 'Hết hàng' : 'Sắp hết'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
