import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  UserCheck,
  Receipt,
  Coins,
  Zap,
} from 'lucide-react'
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

// --- Types ---

type MetricTab = 'revenue' | 'quantity' | 'profit'

const metricLabels: Record<MetricTab, string> = {
  revenue: 'Doanh thu',
  quantity: 'Doanh số',
  profit: 'Lợi nhuận',
}

// --- Mock data ---

const infoCards = [
  {
    title: 'Khách quay lại',
    value: '128',
    change: 12.5,
    description: 'so với tháng trước',
    icon: UserCheck,
  },
  {
    title: 'Giá trị TB/đơn',
    value: '185.000đ',
    change: 5.2,
    description: 'so với tháng trước',
    icon: Receipt,
  },
  {
    title: 'Lợi nhuận TB/đơn',
    value: '52.000đ',
    change: -3.1,
    description: 'so với tháng trước',
    icon: Coins,
  },
  {
    title: 'Tốc độ bán hàng',
    value: '142s',
    change: -8.4,
    description: 'so với tháng trước',
    icon: Zap,
  },
]

const topSellingProducts = [
  { name: 'Paracetamol 500mg', revenue: 18500000, quantity: 420, profit: 5200000 },
  { name: 'Vitamin C 1000mg', revenue: 15200000, quantity: 380, profit: 4100000 },
  { name: 'Amoxicillin 500mg', revenue: 12800000, quantity: 290, profit: 3600000 },
  { name: 'Thuốc ho Bảo Thanh', revenue: 9600000, quantity: 210, profit: 2800000 },
  { name: 'Men vi sinh Bio-acimin', revenue: 8400000, quantity: 185, profit: 2400000 },
]

const slowSellingProducts = [
  { name: 'Cao dán Salonpas', revenue: 450000, quantity: 8, profit: 120000 },
  { name: 'Dầu xanh Con Ó', revenue: 620000, quantity: 12, profit: 180000 },
  { name: 'Bột sủi nhi', revenue: 780000, quantity: 15, profit: 210000 },
  { name: 'Thuốc bổ mắt', revenue: 950000, quantity: 18, profit: 280000 },
  { name: 'Kem chống nắng', revenue: 1100000, quantity: 22, profit: 320000 },
]

const categoryData = [
  { name: 'Thuốc kê đơn', revenue: 35000000, quantity: 820, profit: 9500000 },
  { name: 'Thuốc OTC', revenue: 28000000, quantity: 650, profit: 7800000 },
  { name: 'Thực phẩm CN', revenue: 18000000, quantity: 420, profit: 5200000 },
  { name: 'Dụng cụ y tế', revenue: 8000000, quantity: 180, profit: 2400000 },
  { name: 'Mỹ phẩm', revenue: 5000000, quantity: 110, profit: 1500000 },
]

const hourlyData = [
  { label: '7h', revenue: 2100000, quantity: 25, profit: 580000 },
  { label: '8h', revenue: 4500000, quantity: 52, profit: 1200000 },
  { label: '9h', revenue: 6200000, quantity: 71, profit: 1700000 },
  { label: '10h', revenue: 5800000, quantity: 67, profit: 1600000 },
  { label: '11h', revenue: 4200000, quantity: 48, profit: 1150000 },
  { label: '12h', revenue: 2800000, quantity: 32, profit: 770000 },
  { label: '13h', revenue: 3100000, quantity: 36, profit: 850000 },
  { label: '14h', revenue: 5500000, quantity: 63, profit: 1500000 },
  { label: '15h', revenue: 6800000, quantity: 78, profit: 1850000 },
  { label: '16h', revenue: 7200000, quantity: 83, profit: 1980000 },
  { label: '17h', revenue: 8500000, quantity: 98, profit: 2350000 },
  { label: '18h', revenue: 7800000, quantity: 90, profit: 2150000 },
  { label: '19h', revenue: 5200000, quantity: 60, profit: 1430000 },
  { label: '20h', revenue: 3500000, quantity: 40, profit: 960000 },
  { label: '21h', revenue: 1800000, quantity: 21, profit: 500000 },
]

const dailyData = [
  { label: 'T2', revenue: 12500000, quantity: 145, profit: 3200000 },
  { label: 'T3', revenue: 14200000, quantity: 168, profit: 3800000 },
  { label: 'T4', revenue: 11800000, quantity: 132, profit: 2900000 },
  { label: 'T5', revenue: 15600000, quantity: 189, profit: 4200000 },
  { label: 'T6', revenue: 16800000, quantity: 201, profit: 4600000 },
  { label: 'T7', revenue: 19200000, quantity: 234, profit: 5100000 },
  { label: 'CN', revenue: 17500000, quantity: 215, profit: 4800000 },
]

const weeklyData = [
  { label: 'T1', revenue: 85000000, quantity: 980, profit: 23000000 },
  { label: 'T2', revenue: 92000000, quantity: 1050, profit: 25000000 },
  { label: 'T3', revenue: 78000000, quantity: 890, profit: 21000000 },
  { label: 'T4', revenue: 105000000, quantity: 1200, profit: 28500000 },
  { label: 'T5', revenue: 88000000, quantity: 1010, profit: 24000000 },
  { label: 'T6', revenue: 95000000, quantity: 1090, profit: 25800000 },
  { label: 'T7', revenue: 110000000, quantity: 1260, profit: 30000000 },
  { label: 'T8', revenue: 98000000, quantity: 1120, profit: 26500000 },
  { label: 'T9', revenue: 102000000, quantity: 1170, profit: 27800000 },
  { label: 'T10', revenue: 115000000, quantity: 1320, profit: 31200000 },
  { label: 'T11', revenue: 108000000, quantity: 1240, profit: 29400000 },
  { label: 'T12', revenue: 120000000, quantity: 1380, profit: 32600000 },
  { label: 'T13', revenue: 95000000, quantity: 1090, profit: 25800000 },
  { label: 'T14', revenue: 88000000, quantity: 1010, profit: 24000000 },
  { label: 'T15', revenue: 105000000, quantity: 1200, profit: 28500000 },
  { label: 'T16', revenue: 92000000, quantity: 1050, profit: 25000000 },
  { label: 'T17', revenue: 110000000, quantity: 1260, profit: 30000000 },
  { label: 'T18', revenue: 98000000, quantity: 1120, profit: 26500000 },
  { label: 'T19', revenue: 102000000, quantity: 1170, profit: 27800000 },
  { label: 'T20', revenue: 115000000, quantity: 1320, profit: 31200000 },
  { label: 'T21', revenue: 108000000, quantity: 1240, profit: 29400000 },
  { label: 'T22', revenue: 120000000, quantity: 1380, profit: 32600000 },
  { label: 'T23', revenue: 125000000, quantity: 1440, profit: 34000000 },
  { label: 'T24', revenue: 118000000, quantity: 1360, profit: 32100000 },
  { label: 'T25', revenue: 130000000, quantity: 1500, profit: 35400000 },
  { label: 'T26', revenue: 122000000, quantity: 1400, profit: 33200000 },
  { label: 'T27', revenue: 135000000, quantity: 1550, profit: 36700000 },
  { label: 'T28', revenue: 128000000, quantity: 1470, profit: 34800000 },
  { label: 'T29', revenue: 140000000, quantity: 1610, profit: 38100000 },
  { label: 'T30', revenue: 132000000, quantity: 1520, profit: 35900000 },
  { label: 'T31', revenue: 145000000, quantity: 1670, profit: 39400000 },
  { label: 'T32', revenue: 138000000, quantity: 1590, profit: 37500000 },
  { label: 'T33', revenue: 150000000, quantity: 1730, profit: 40800000 },
  { label: 'T34', revenue: 142000000, quantity: 1640, profit: 38600000 },
  { label: 'T35', revenue: 148000000, quantity: 1700, profit: 40200000 },
  { label: 'T36', revenue: 155000000, quantity: 1780, profit: 42100000 },
  { label: 'T37', revenue: 160000000, quantity: 1840, profit: 43500000 },
  { label: 'T38', revenue: 152000000, quantity: 1750, profit: 41300000 },
  { label: 'T39', revenue: 158000000, quantity: 1820, profit: 42900000 },
  { label: 'T40', revenue: 165000000, quantity: 1900, profit: 44800000 },
  { label: 'T41', revenue: 170000000, quantity: 1960, profit: 46200000 },
  { label: 'T42', revenue: 162000000, quantity: 1870, profit: 44100000 },
  { label: 'T43', revenue: 168000000, quantity: 1930, profit: 45600000 },
  { label: 'T44', revenue: 175000000, quantity: 2010, profit: 47500000 },
  { label: 'T45', revenue: 180000000, quantity: 2070, profit: 48900000 },
  { label: 'T46', revenue: 172000000, quantity: 1980, profit: 46700000 },
  { label: 'T47', revenue: 178000000, quantity: 2050, profit: 48300000 },
  { label: 'T48', revenue: 185000000, quantity: 2130, profit: 50200000 },
  { label: 'T49', revenue: 190000000, quantity: 2190, profit: 51600000 },
  { label: 'T50', revenue: 182000000, quantity: 2100, profit: 49500000 },
  { label: 'T51', revenue: 188000000, quantity: 2160, profit: 51000000 },
  { label: 'T52', revenue: 195000000, quantity: 2250, profit: 53000000 },
]

const topVipCustomers = [
  { name: 'Nguyễn Văn An', phone: '0901***123', revenue: 45200000, quantity: 320, profit: 12800000, orders: 32 },
  { name: 'Trần Thị Bích', phone: '0912***456', revenue: 38500000, quantity: 280, profit: 10900000, orders: 28 },
  { name: 'Lê Hoàng Minh', phone: '0938***789', revenue: 31800000, quantity: 240, profit: 9100000, orders: 24 },
  { name: 'Phạm Thùy Dung', phone: '0976***321', revenue: 27600000, quantity: 210, profit: 7800000, orders: 21 },
  { name: 'Võ Đức Thắng', phone: '0865***654', revenue: 24100000, quantity: 190, profit: 6900000, orders: 19 },
]

const PIE_OPACITIES = [1, 0.8, 0.6, 0.4, 0.25]

const tooltipStyle = {
  backgroundColor: 'hsl(var(--popover))',
  border: '1px solid hsl(var(--border))',
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

function InfoCards() {
  return (
    <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
      {infoCards.map((card) => {
        const isUp = card.change >= 0
        const isSpeedCard = card.title === 'Tốc độ bán hàng'
        const changeColor = isSpeedCard
          ? (isUp ? 'text-red-500' : 'text-emerald-500')
          : (isUp ? 'text-emerald-500' : 'text-red-500')

        return (
          <Card key={card.title}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
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
                <span>{card.description}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function TopSellingCard() {
  const [metric, setMetric] = useState<MetricTab>('revenue')

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
        <ResponsiveContainer width='100%' height={220}>
          <BarChart data={topSellingProducts} layout='vertical' margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
            <XAxis type='number' hide />
            <YAxis type='category' dataKey='name' width={130} stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [
                metric === 'quantity' ? formatNumber(value) : formatVND(value),
                metricLabels[metric],
              ]}
            />
            <Bar dataKey={metric} fill='hsl(var(--primary))' radius={[0, 4, 4, 0]} maxBarSize={24}>
              {topSellingProducts.map((_, index) => (
                <Cell key={index} fillOpacity={1 - index * 0.15} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function SlowSellingCard() {
  const [metric, setMetric] = useState<MetricTab>('revenue')

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
        <ResponsiveContainer width='100%' height={220}>
          <BarChart data={slowSellingProducts} layout='vertical' margin={{ top: 0, right: 10, bottom: 0, left: 0 }}>
            <XAxis type='number' hide />
            <YAxis type='category' dataKey='name' width={130} stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [
                metric === 'quantity' ? formatNumber(value) : formatVND(value),
                metricLabels[metric],
              ]}
            />
            <Bar dataKey={metric} fill='hsl(var(--destructive))' radius={[0, 4, 4, 0]} maxBarSize={24}>
              {slowSellingProducts.map((_, index) => (
                <Cell key={index} fillOpacity={1 - index * 0.15} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function CategoryPieCard() {
  const [metric, setMetric] = useState<MetricTab>('revenue')
  const total = categoryData.reduce((s, i) => s + getMetricValue(i, metric), 0)

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
        <div className='flex items-center gap-6'>
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie
                data={categoryData}
                cx='50%'
                cy='50%'
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey={metric}
                stroke='hsl(var(--background))'
                strokeWidth={2}
              >
                {categoryData.map((_, index) => (
                  <Cell key={index} fill='hsl(var(--foreground))' fillOpacity={PIE_OPACITIES[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [
                  metric === 'quantity' ? formatNumber(value) : formatVND(value),
                  metricLabels[metric],
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className='flex-1 space-y-2.5'>
            {categoryData.map((item, index) => {
              const val = getMetricValue(item, metric)
              return (
                <div key={item.name} className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='h-2.5 w-2.5 rounded-full bg-foreground' style={{ opacity: PIE_OPACITIES[index] }} />
                    <span className='text-xs text-muted-foreground'>{item.name}</span>
                  </div>
                  <span className='text-xs font-medium'>{Math.round((val / total) * 100)}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TopVipCustomersCard() {
  const [metric, setMetric] = useState<MetricTab>('revenue')
  const sorted = [...topVipCustomers].sort((a, b) => getMetricValue(b, metric) - getMetricValue(a, metric))

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
        <div className='space-y-3'>
          {sorted.map((customer, index) => (
            <div key={customer.phone} className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10 text-[11px] font-bold text-amber-600'>
                  {index + 1}
                </div>
                <div>
                  <div className='text-xs font-medium'>{customer.name}</div>
                  <div className='text-[11px] text-muted-foreground'>{customer.phone} · {customer.orders} đơn</div>
                </div>
              </div>
              <span className='text-xs font-semibold'>
                {metric === 'quantity' ? formatNumber(getMetricValue(customer, metric)) : formatVND(getMetricValue(customer, metric))}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

type TimeRange = 'hour' | 'day' | 'week'

const timeRangeLabels: Record<TimeRange, string> = {
  hour: 'Theo giờ',
  day: 'Theo ngày',
  week: 'Theo tuần',
}

const timeRangeData: Record<TimeRange, typeof hourlyData> = {
  hour: hourlyData,
  day: dailyData,
  week: weeklyData,
}

function AverageRevenueCard() {
  const [metric, setMetric] = useState<MetricTab>('revenue')
  const [timeRange, setTimeRange] = useState<TimeRange>('hour')

  const data = timeRangeData[timeRange]

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-sm'>Trung bình {metricLabels[metric].toLowerCase()} {timeRangeLabels[timeRange].toLowerCase()}</CardTitle>
            <CardDescription className='text-xs'>Phân tích xu hướng theo thời gian trong năm</CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <div className='inline-flex h-7 items-center rounded-md bg-muted p-0.5 text-muted-foreground'>
              {(Object.keys(timeRangeLabels) as TimeRange[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setTimeRange(key)}
                  className={cn(
                    'inline-flex h-6 items-center rounded px-2 text-[11px] font-medium transition-colors',
                    timeRange === key
                      ? 'bg-background text-foreground shadow-sm'
                      : 'hover:text-foreground'
                  )}
                >
                  {timeRangeLabels[key]}
                </button>
              ))}
            </div>
            <MetricTabSwitcher active={metric} onChange={setMetric} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={280}>
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
            <XAxis dataKey='label' stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} />
            <YAxis
              stroke='hsl(var(--muted-foreground))'
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => metric === 'quantity' ? v : formatVND(v)}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number) => [
                metric === 'quantity' ? formatNumber(value) : formatVND(value),
                metricLabels[metric],
              ]}
            />
            <Legend />
            <Line
              type='monotone'
              dataKey={metric}
              name={metricLabels[metric]}
              stroke='hsl(var(--primary))'
              strokeWidth={2}
              dot={timeRange === 'week' ? false : { r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

// --- Main ---

export function SalesPerformance() {
  return (
    <div className='space-y-4'>
      <InfoCards />
      <AverageRevenueCard />

      <div className='grid gap-4 md:grid-cols-2'>
        <TopSellingCard />
        <SlowSellingCard />
      </div>

      <div className='grid gap-4 md:grid-cols-2'>
        <CategoryPieCard />
        <TopVipCustomersCard />
      </div>
    </div>
  )
}
