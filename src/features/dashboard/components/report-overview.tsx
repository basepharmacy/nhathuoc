import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, formatDateLabel, formatQuantity } from '@/lib/utils'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useUser } from '@/client/provider'
import { useLocationContext } from '@/context/location-provider'
import {
  getExpiredInventoryBatchesQueryOptions,
  getLowStockProductsQueryOptions,
  getSalesStatisticsQueryOptions,
  getTopProductsQueryOptions,
} from '@/client/queries'
import type { TopProductType } from '@/services/supabase/database/repo/dashboardReportRepo'
import {
  AlertTriangle,
  CalendarX,
  DollarSign,
  ShoppingCart,
  TrendingDownIcon,
  TrendingUp,
  TrendingUpIcon,
} from 'lucide-react'
import type { TimePeriod } from '..'

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

const topProductDescriptions: Record<TimePeriod, string> = {
  day: '5 sản phẩm bán chạy nhất hôm nay',
  week: '5 sản phẩm bán chạy nhất tuần này',
  month: '5 sản phẩm bán chạy nhất tháng này',
  quarter: '5 sản phẩm bán chạy nhất quý này',
  year: '5 sản phẩm bán chạy nhất năm nay',
}


function ChangeBadge({ value, label }: { value: number; label: string }) {
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

export function ReportOverview({ timePeriod }: { timePeriod: TimePeriod }) {
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()
  const locationId = selectedLocationId ?? user?.location?.id ?? undefined
  const tenantId = user?.profile?.tenant_id ?? ''

  const [topProductTab, setTopProductTab] = useState<TopProductType>('by_quantity')

  const { data: reportMetrics } = useQuery({
    ...getSalesStatisticsQueryOptions({
      period: timePeriod,
      locationId,
    }),
    enabled: !!user,
  })

  const { data: topProducts = [] } = useQuery({
    ...getTopProductsQueryOptions({
      period: timePeriod,
      type: topProductTab,
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
            <TrendingDownIcon className='h-4 w-4 text-muted-foreground' />
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

      <div className='grid gap-4 lg:grid-cols-5'>
        <Card className='lg:col-span-3'>
          <Tabs
            defaultValue='by_quantity'
            value={topProductTab}
            onValueChange={(v) => setTopProductTab(v as TopProductType)}
            className='flex flex-1 flex-col'
          >
            <CardHeader className='space-y-2'>
              <div className='flex items-center gap-4'>
                <CardTitle>Top danh sách sản phẩm bán chạy</CardTitle>
                <TabsList className='ml-auto shrink-0'>
                  <TabsTrigger value='by_quantity'>Doanh số</TabsTrigger>
                  <TabsTrigger value='by_revenue'>Doanh thu</TabsTrigger>
                  <TabsTrigger value='by_profit'>Lợi nhuận</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>{topProductDescriptions[timePeriod]}</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-1 flex-col'>
              <div className='space-y-3'>
                {topProducts.map((product, index) => (
                  <div
                    key={`${product.id ?? product.name}-${topProductTab}`}
                    className='flex flex-wrap items-center justify-between gap-3 rounded-lg border border-transparent bg-muted/40 px-3 py-2'
                  >
                    <div className='flex items-center gap-3'>
                      <span className='flex size-6 items-center justify-center rounded-full bg-background text-xs font-medium'>
                        {index + 1}
                      </span>
                      <div>
                        <p className='text-sm font-medium'>{product.name}</p>
                        <p className='text-xs text-muted-foreground'>
                          {formatQuantity(product.quantity)} {product.unitName}
                        </p>
                      </div>
                    </div>
                    <div className='text-sm font-semibold'>
                      {topProductTab === 'by_quantity'
                        ? `${formatQuantity(product.quantity)} ${product.unitName}`
                        : topProductTab === 'by_revenue'
                          ? formatCurrency(product.revenue, { style: 'currency' })
                          : formatCurrency(product.profit, { style: 'currency' })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Tabs>
        </Card>

        <div className='space-y-4 lg:col-span-2'>
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
    </div>
  )
}
