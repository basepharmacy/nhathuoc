import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  TrendingUp,
  TrendingDown,
  UserCheck,
  Receipt,
  Coins,
  Zap,
  Loader2,
} from 'lucide-react'
import { useUser } from '@/client/provider'
import { useLocationContext } from '@/context/location-provider'
import { getAdvanceSaleStatisticsQueryOptions, getAdvanceTopProductsQueryOptions, getTopSlowSellProductsQueryOptions, getTopCustomersQueryOptions, getTopCategoriesQueryOptions, getSalesTimeSeriesQueryOptions } from '@/client/queries'
import type { AdvancedPeriod, TopProductType, TopCustomerType, TopCategoryType, SalesTimeSeriesGroupBy, SalesTimeSeriesType } from '@/services/supabase/database/repo/dashboardReportRepo'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Link } from '@tanstack/react-router'
import {
  DUMMY_STATISTICS,
  DUMMY_TOP_PRODUCTS,
  DUMMY_SLOW_PRODUCTS,
  DUMMY_CATEGORIES,
  DUMMY_CUSTOMERS,
  DUMMY_TIME_SERIES,
} from '../dummy/sales-performance'

// --- Types ---

type MetricTab = 'revenue' | 'quantity' | 'profit'

const metricLabels: Record<MetricTab, string> = {
  revenue: 'Doanh thu',
  quantity: 'Doanh số',
  profit: 'Lợi nhuận',
}

// --- Mock data ---

const metricToTopProductType: Record<MetricTab, TopProductType> = {
  revenue: 'by_revenue',
  quantity: 'by_quantity',
  profit: 'by_profit',
}

const metricToCategoryType: Record<MetricTab, TopCategoryType> = {
  revenue: 'by_revenue',
  quantity: 'by_quantity',
  profit: 'by_profit',
}

const metricToTimeSeriesType: Record<MetricTab, SalesTimeSeriesType> = {
  revenue: 'by_revenue',
  quantity: 'by_order_count',
  profit: 'by_profit',
}

const metricToCustomerType: Record<MetricTab, TopCustomerType> = {
  revenue: 'by_revenue',
  quantity: 'by_quantity',
  profit: 'by_profit',
}

const PIE_OPACITIES = [1, 0.8, 0.6, 0.4, 0.25]

const tooltipStyle = {
  backgroundColor: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  fontSize: '12px',
}

// --- Helpers ---

function formatVND(value: number) {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}T`
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}tr`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
  return value.toString()
}

function formatNumber(value: number) {
  return value.toLocaleString('vi-VN')
}

function getMetricValue(item: Record<string, unknown>, metric: MetricTab) {
  return item[metric] as number
}

// --- Sub-components ---

function MetricTabSwitcher({ active, onChange }: { active: MetricTab; onChange: (tab: MetricTab) => void }) {
  return (
    <div className='inline-flex h-7 items-center rounded-md bg-muted p-0.5 text-muted-foreground'>
      {(Object.keys(metricLabels) as MetricTab[]).map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            'inline-flex h-6 items-center rounded px-2 text-[11px] font-medium transition-colors',
            active === key
              ? 'bg-background text-foreground shadow-sm'
              : 'hover:text-foreground'
          )}
        >
          {metricLabels[key]}
        </button>
      ))}
    </div>
  )
}

function periodToReferenceDate(period: AdvancedPeriod, selectedPeriod: string): string {
  if (period === 'month') {
    return `${selectedPeriod}-01`
  }
  if (period === 'quarter') {
    const year = selectedPeriod.slice(0, 4)
    const quarter = parseInt(selectedPeriod.slice(4), 10)
    const month = String((quarter - 1) * 3 + 1).padStart(2, '0')
    return `${year}-${month}-01`
  }
  return `${selectedPeriod}-01-01`
}

const periodChangeLabels: Record<AdvancedPeriod, string> = {
  month: 'so với tháng trước',
  quarter: 'so với quý trước',
  year: 'so với năm trước',
}

function InfoCards({ period, selectedPeriod, isDummy }: { period: AdvancedPeriod; selectedPeriod: string; isDummy: boolean }) {
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()
  const referenceDate = useMemo(() => periodToReferenceDate(period, selectedPeriod), [period, selectedPeriod])

  const { data, isLoading } = useQuery({
    ...getAdvanceSaleStatisticsQueryOptions({
      period,
      referenceDate,
      locationId: selectedLocationId,
    }),
    enabled: !!user && !isDummy,
  })

  const resolved = isDummy ? DUMMY_STATISTICS : data

  const description = periodChangeLabels[period]

  const cards = [
    {
      title: 'Khách quay lại',
      subtitle: 'Số khách quay lại mua hàng',
      value: formatNumber(resolved?.returningCustomers ?? 0),
      change: resolved?.returningCustomersChange ?? 0,
      icon: UserCheck,
    },
    {
      title: 'Biên lợi nhuận',
      subtitle: 'Tỷ lệ lợi nhuận trên doanh thu',
      value: `${(resolved?.profitMargin ?? 0).toFixed(1)}%`,
      change: resolved?.profitMarginChange ?? 0,
      icon: Coins,
    },
    {
      title: 'Tỷ lệ trả đơn',
      subtitle: 'Tỉ lệ đơn bị hủy trên tổng số đơn',
      value: `${(resolved?.returnRate ?? 0).toFixed(1)}%`,
      change: resolved?.returnRateChange ?? 0,
      icon: Receipt,
      invertColor: true,
    },
    {
      title: 'Tốc độ bán hàng',
      subtitle: 'Thời gian TB xử lý mỗi đơn',
      value: `${Math.round(resolved?.avgSaleSpeed ?? 0)}s`,
      change: resolved?.avgSaleSpeedChange ?? 0,
      icon: Zap,
      invertColor: true,
    },
  ]

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className='flex h-[120px] items-center justify-center'>
              <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
      {cards.map((card) => {
        const isUp = card.change >= 0
        const invert = card.invertColor
        const changeColor = invert
          ? (isUp ? 'text-red-500' : 'text-emerald-500')
          : (isUp ? 'text-emerald-500' : 'text-red-500')

        return (
          <Card key={card.title}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <div>
                <CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
                <p className='text-xs text-muted-foreground'>{card.subtitle}</p>
              </div>
              <card.icon className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{card.value}</div>
              <div className='flex items-center gap-1.5 text-xs text-muted-foreground'>
                {isUp ? (
                  <TrendingUp className={cn('h-3 w-3', changeColor)} />
                ) : (
                  <TrendingDown className={cn('h-3 w-3', changeColor)} />
                )}
                <span className={cn('font-medium', changeColor)}>
                  {isUp ? '+' : ''}{card.change}%
                </span>
                <span>{description}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function TopSellingCard({ period, selectedPeriod, isDummy }: { period: AdvancedPeriod; selectedPeriod: string; isDummy: boolean }) {
  const [metric, setMetric] = useState<MetricTab>('revenue')
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()
  const referenceDate = useMemo(() => periodToReferenceDate(period, selectedPeriod), [period, selectedPeriod])

  const { data: products = [], isLoading } = useQuery({
    ...getAdvanceTopProductsQueryOptions({
      period,
      referenceDate,
      type: metricToTopProductType[metric],
      locationId: selectedLocationId,
    }),
    enabled: !!user && !isDummy,
  })

  const resolvedProducts = isDummy ? DUMMY_TOP_PRODUCTS : products

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-sm'>Top bán chạy</CardTitle>
            <CardDescription className='text-xs'>5 sản phẩm bán chạy nhất</CardDescription>
          </div>
          <MetricTabSwitcher active={metric} onChange={setMetric} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex h-[220px] items-center justify-center'>
            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
          </div>
        ) : resolvedProducts.length === 0 ? (
          <div className='flex h-[220px] items-center justify-center text-sm text-muted-foreground'>
            Không có dữ liệu
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={220}>
            <BarChart data={resolvedProducts} layout='vertical' margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <XAxis type='number' hide />
              <YAxis type='category' dataKey='name' width={130} stroke='var(--muted-foreground)' fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [
                  metric === 'quantity' ? formatNumber((value ?? 0) as number) : formatVND((value ?? 0) as number),
                  metricLabels[metric],
                ]}
              />
              <Bar dataKey={metric} fill='var(--primary)' radius={[0, 4, 4, 0]} maxBarSize={24}>
                {resolvedProducts.map((_, index) => (
                  <Cell key={index} fillOpacity={1 - index * 0.15} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

function SlowSellingCard({ period, selectedPeriod, isDummy }: { period: AdvancedPeriod; selectedPeriod: string; isDummy: boolean }) {
  const [metric, setMetric] = useState<MetricTab>('revenue')
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()
  const referenceDate = useMemo(() => periodToReferenceDate(period, selectedPeriod), [period, selectedPeriod])

  const { data: products = [], isLoading } = useQuery({
    ...getTopSlowSellProductsQueryOptions({
      period,
      referenceDate,
      type: metricToTopProductType[metric],
      locationId: selectedLocationId,
    }),
    enabled: !!user && !isDummy,
  })

  const resolvedProducts = isDummy ? DUMMY_SLOW_PRODUCTS : products

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-sm'>Top bán chậm</CardTitle>
            <CardDescription className='text-xs'>5 sản phẩm bán chậm nhất</CardDescription>
          </div>
          <MetricTabSwitcher active={metric} onChange={setMetric} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex h-[220px] items-center justify-center'>
            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
          </div>
        ) : resolvedProducts.length === 0 ? (
          <div className='flex h-[220px] items-center justify-center text-sm text-muted-foreground'>
            Không có dữ liệu
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={220}>
            <BarChart data={resolvedProducts} layout='vertical' margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
              <XAxis type='number' hide />
              <YAxis type='category' dataKey='name' width={130} stroke='var(--muted-foreground)' fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [
                  metric === 'quantity' ? formatNumber((value ?? 0) as number) : formatVND((value ?? 0) as number),
                  metricLabels[metric],
                ]}
              />
              <Bar dataKey={metric} fill='var(--destructive)' radius={[0, 4, 4, 0]} maxBarSize={24}>
                {resolvedProducts.map((_, index) => (
                  <Cell key={index} fillOpacity={1 - index * 0.15} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

function CategoryPieCard({ period, selectedPeriod, isDummy }: { period: AdvancedPeriod; selectedPeriod: string; isDummy: boolean }) {
  const [metric, setMetric] = useState<MetricTab>('revenue')
  const { selectedLocationId } = useLocationContext()
  const user = useUser()
  const referenceDate = useMemo(() => periodToReferenceDate(period, selectedPeriod), [period, selectedPeriod])

  const { data: categories = [], isLoading } = useQuery({
    ...getTopCategoriesQueryOptions({
      period,
      referenceDate,
      type: metricToCategoryType[metric],
      locationId: selectedLocationId,
    }),
    enabled: !!user && !isDummy,
  })

  const resolvedCategories = isDummy ? DUMMY_CATEGORIES : categories

  const grouped = useMemo(() => {
    if (resolvedCategories.length <= 5) return resolvedCategories
    const top4 = resolvedCategories.slice(0, 4)
    const rest = resolvedCategories.slice(4)
    return [
      ...top4,
      {
        id: 'other',
        name: 'Danh mục khác',
        revenue: rest.reduce((s, i) => s + i.revenue, 0),
        quantity: rest.reduce((s, i) => s + i.quantity, 0),
        profit: rest.reduce((s, i) => s + i.profit, 0),
      },
    ]
  }, [resolvedCategories])

  const total = grouped.reduce((s, i) => s + getMetricValue(i, metric), 0)

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-sm'>Theo danh mục</CardTitle>
            <CardDescription className='text-xs'>Tỷ lệ {metricLabels[metric].toLowerCase()} theo nhóm sản phẩm</CardDescription>
          </div>
          <MetricTabSwitcher active={metric} onChange={setMetric} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
          </div>
        ) : grouped.length === 0 ? (
          <div className='text-center text-xs text-muted-foreground py-8'>Không có dữ liệu</div>
        ) : (
          <div className='flex items-center gap-6'>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={grouped}
                  cx='50%'
                  cy='50%'
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey={metric}
                  stroke='var(--background)'
                  strokeWidth={2}
                >
                  {grouped.map((_, index) => (
                    <Cell key={index} fill='var(--foreground)' fillOpacity={PIE_OPACITIES[index]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value) => [
                    metric === 'quantity' ? formatNumber((value ?? 0) as number) : formatVND((value ?? 0) as number),
                    metricLabels[metric],
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className='flex-1 space-y-2.5'>
              {grouped.map((item, index) => {
                const val = getMetricValue(item, metric)
                return (
                  <div key={item.name} className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='h-2.5 w-2.5 rounded-full bg-foreground' style={{ opacity: PIE_OPACITIES[index] }} />
                      <span className='text-xs text-muted-foreground'>{item.name}</span>
                    </div>
                    <span className='text-xs font-medium'>{total > 0 ? Math.round((val / total) * 100) : 0}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function TopVipCustomersCard({ period, selectedPeriod, isDummy }: { period: AdvancedPeriod; selectedPeriod: string; isDummy: boolean }) {
  const [metric, setMetric] = useState<MetricTab>('revenue')
  const { selectedLocationId } = useLocationContext()
  const user = useUser()
  const referenceDate = useMemo(() => periodToReferenceDate(period, selectedPeriod), [period, selectedPeriod])

  const { data: customers = [], isLoading } = useQuery({
    ...getTopCustomersQueryOptions({
      period,
      referenceDate,
      type: metricToCustomerType[metric],
      locationId: selectedLocationId,
    }),
    enabled: !!user && !isDummy,
  })

  const resolvedCustomers = isDummy ? DUMMY_CUSTOMERS : customers

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-sm'>Top khách hàng VIP</CardTitle>
            <CardDescription className='text-xs'>Khách hàng có {metricLabels[metric].toLowerCase()} cao nhất</CardDescription>
          </div>
          <MetricTabSwitcher active={metric} onChange={setMetric} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex items-center justify-center py-8'>
            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
          </div>
        ) : resolvedCustomers.length === 0 ? (
          <div className='text-center text-xs text-muted-foreground py-8'>Không có dữ liệu</div>
        ) : (
          <div className='space-y-3'>
            {resolvedCustomers.map((customer, index) => (
              <div key={customer.id} className='flex items-center justify-between'>
                <Link
                  to='/customers/$customerId'
                  params={{ customerId: customer.id }}
                  className='flex items-center gap-3 hover:opacity-70 transition-opacity'
                >
                  <div className='flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-600'>
                    {index + 1}
                  </div>
                  <div>
                    <div className='text-sm font-medium'>{customer.name}</div>
                    <div className='text-xs text-muted-foreground'>{customer.phone}</div>
                  </div>
                </Link>
                <span className='text-sm font-semibold'>
                  {metric === 'quantity' ? formatNumber(getMetricValue(customer, metric)) : formatVND(getMetricValue(customer, metric))}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

type TimeView = 'hour' | 'weekday' | 'date'

const timeViewLabels: Record<TimeView, string> = {
  hour: 'Theo giờ',
  weekday: 'Theo thứ',
  date: 'Theo ngày',
}

const timeViewToGroupBy: Record<TimeView, SalesTimeSeriesGroupBy> = {
  hour: 'hour',
  weekday: 'day_of_week',
  date: 'day',
}

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

function formatTimeKey(timeKey: number, groupBy: SalesTimeSeriesGroupBy) {
  if (groupBy === 'hour') return `${timeKey}h`
  if (groupBy === 'day_of_week') return WEEKDAY_LABELS[timeKey - 1] ?? `${timeKey}`
  return `${timeKey}`
}

function AverageRevenueCard({ period, selectedPeriod, isDummy }: { period: AdvancedPeriod; selectedPeriod: string; isDummy: boolean }) {
  const [metric, setMetric] = useState<MetricTab>('revenue')
  const [timeView, setTimeView] = useState<TimeView>('hour')
  const { selectedLocationId } = useLocationContext()
  const user = useUser()
  const referenceDate = useMemo(() => periodToReferenceDate(period, selectedPeriod), [period, selectedPeriod])
  const groupBy = timeViewToGroupBy[timeView]

  const { data: rawData = [], isLoading } = useQuery({
    ...getSalesTimeSeriesQueryOptions({
      period,
      referenceDate,
      groupBy,
      type: metricToTimeSeriesType[metric],
      locationId: selectedLocationId,
    }),
    enabled: !!user && !isDummy,
  })

  const resolvedData = isDummy ? DUMMY_TIME_SERIES : rawData

  const chartData = useMemo(() =>
    resolvedData.map((item) => ({
      label: formatTimeKey(item.timeKey, groupBy),
      revenue: item.revenue,
      quantity: item.quantity,
      profit: item.profit,
    })),
    [resolvedData, groupBy]
  )

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-sm'>Trung bình {metricLabels[metric].toLowerCase()} {timeViewLabels[timeView].toLowerCase()}</CardTitle>
            <CardDescription className='text-xs'>Phân tích xu hướng theo thời gian</CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <div className='inline-flex h-7 items-center rounded-md bg-muted p-0.5 text-muted-foreground'>
              {(Object.keys(timeViewLabels) as TimeView[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setTimeView(key)}
                  className={cn(
                    'inline-flex h-6 items-center rounded px-2 text-[11px] font-medium transition-colors',
                    timeView === key
                      ? 'bg-background text-foreground shadow-sm'
                      : 'hover:text-foreground'
                  )}
                >
                  {timeViewLabels[key]}
                </button>
              ))}
            </div>
            <MetricTabSwitcher active={metric} onChange={setMetric} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex h-[280px] items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : chartData.length === 0 ? (
          <div className='flex h-[280px] items-center justify-center text-sm text-muted-foreground'>
            Không có dữ liệu
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={280}>
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray='3 3' stroke='var(--border)' />
              <XAxis dataKey='label' stroke='var(--muted-foreground)' fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke='var(--muted-foreground)'
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => metric === 'quantity' ? v : formatVND(v)}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => [
                  metric === 'quantity' ? formatNumber((value ?? 0) as number) : formatVND((value ?? 0) as number),
                  metricLabels[metric],
                ]}
              />
              <Legend />
              <Line
                type='monotone'
                dataKey={metric}
                name={metricLabels[metric]}
                stroke='var(--primary)'
                strokeWidth={2}
                dot={timeView === 'date' ? false : { r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

// --- Main ---

export function SalesPerformance({ period, selectedPeriod, isDummy }: { period: AdvancedPeriod; selectedPeriod: string; isDummy: boolean }) {
  return (
    <div className='space-y-4'>
      <AverageRevenueCard period={period} selectedPeriod={selectedPeriod} isDummy={isDummy} />
      <InfoCards period={period} selectedPeriod={selectedPeriod} isDummy={isDummy} />

      <div className='grid gap-4 md:grid-cols-2'>
        <TopSellingCard period={period} selectedPeriod={selectedPeriod} isDummy={isDummy} />
        <SlowSellingCard period={period} selectedPeriod={selectedPeriod} isDummy={isDummy} />
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <CategoryPieCard period={period} selectedPeriod={selectedPeriod} isDummy={isDummy} />
        <TopVipCustomersCard period={period} selectedPeriod={selectedPeriod} isDummy={isDummy} />
      </div>
    </div>
  )
}
