import { useState } from 'react'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Ban,
  Percent,
  ShieldAlert,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
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

// --- Mock data ---

const infoCards = [
  {
    title: 'Giá trị tồn kho',
    value: '1.85 tỷ',
    unit: '',
    change: 5.8,
    description: 'so với tháng trước',
    icon: DollarSign,
    inverted: false,
  },
  {
    title: 'Giá trị vốn đọng',
    value: '320 tr',
    unit: '',
    change: 8.2,
    description: 'SP không bán được 60 ngày',
    icon: Ban,
    inverted: true,
  },
  {
    title: 'Tỉ lệ vốn đọng',
    value: '17.3%',
    unit: '',
    change: 2.1,
    description: 'so với tổng giá trị kho',
    icon: Percent,
    inverted: true,
  },
  {
    title: 'Thất thoát tiềm năng',
    value: '85 tr',
    unit: '',
    change: 15.4,
    description: 'lô hết hạn trong 30 ngày tới',
    icon: ShieldAlert,
    inverted: true,
  },
]

const categoryData = [
  { name: 'Thuốc kê đơn', quantity: 3200, value: 520000000 },
  { name: 'Thuốc OTC', quantity: 4100, value: 480000000 },
  { name: 'Thực phẩm CN', quantity: 2800, value: 380000000 },
  { name: 'Dụng cụ y tế', quantity: 1500, value: 290000000 },
  { name: 'Mỹ phẩm', quantity: 850, value: 180000000 },
]

const topStaleBatches = [
  { name: 'Paracetamol 500mg – Lô 2024A3', days: 185, quantity: 580, value: 142000000 },
  { name: 'Omega-3 Fish Oil – Lô 2024B1', days: 162, quantity: 190, value: 95000000 },
  { name: 'Men vi sinh Bio-acimin – Lô 2024C2', days: 148, quantity: 260, value: 82000000 },
  { name: 'Calcium + D3 – Lô 2024A8', days: 134, quantity: 180, value: 54000000 },
  { name: 'Vitamin tổng hợp Centrum – Lô 2024D1', days: 120, quantity: 320, value: 185000000 },
  { name: 'Thuốc ho Bảo Thanh – Lô 2024E5', days: 112, quantity: 220, value: 68000000 },
  { name: 'Vitamin C 1000mg – Lô 2024F2', days: 98, quantity: 350, value: 76000000 },
  { name: 'Amoxicillin 500mg – Lô 2024G1', days: 87, quantity: 410, value: 128000000 },
]

const smartAlerts = [
  {
    product: 'Vitamin C 1000mg',
    batch: 'Lô 2024F2',
    remaining: 200,
    unit: 'hộp',
    expiryMonths: 2,
    avgSalesPerMonth: 30,
    severity: 'critical' as const,
  },
  {
    product: 'Omega-3 Fish Oil',
    batch: 'Lô 2024B1',
    remaining: 150,
    unit: 'hộp',
    expiryMonths: 3,
    avgSalesPerMonth: 40,
    severity: 'warning' as const,
  },
  {
    product: 'Paracetamol 500mg',
    batch: 'Lô 2024A3',
    remaining: 400,
    unit: 'hộp',
    expiryMonths: 4,
    avgSalesPerMonth: 85,
    severity: 'warning' as const,
  },
  {
    product: 'Men vi sinh Bio-acimin',
    batch: 'Lô 2024C2',
    remaining: 180,
    unit: 'hộp',
    expiryMonths: 1.5,
    avgSalesPerMonth: 50,
    severity: 'critical' as const,
  },
]

const deadCapitalRatioData = [
  { label: 'T1', total: 1720000000, dead: 245000000 },
  { label: 'T2', total: 1768000000, dead: 258000000 },
  { label: 'T3', total: 1736000000, dead: 262000000 },
  { label: 'T4', total: 1768000000, dead: 270000000 },
  { label: 'T5', total: 1816000000, dead: 278000000 },
  { label: 'T6', total: 1776000000, dead: 285000000 },
  { label: 'T7', total: 1752000000, dead: 290000000 },
  { label: 'T8', total: 1800000000, dead: 295000000 },
  { label: 'T9', total: 1832000000, dead: 300000000 },
  { label: 'T10', total: 1800000000, dead: 305000000 },
  { label: 'T11', total: 1840000000, dead: 312000000 },
  { label: 'T12', total: 1850000000, dead: 320000000 },
]

const flowData = [
  { label: 'T1', nhap_qty: 320, xuat_qty: 280, ton_qty: 12100, nhap_val: 256000000, xuat_val: 224000000, ton_val: 1720000000 },
  { label: 'T2', nhap_qty: 450, xuat_qty: 390, ton_qty: 12160, nhap_val: 360000000, xuat_val: 312000000, ton_val: 1768000000 },
  { label: 'T3', nhap_qty: 380, xuat_qty: 420, ton_qty: 12120, nhap_val: 304000000, xuat_val: 336000000, ton_val: 1736000000 },
  { label: 'T4', nhap_qty: 520, xuat_qty: 480, ton_qty: 12160, nhap_val: 416000000, xuat_val: 384000000, ton_val: 1768000000 },
  { label: 'T5', nhap_qty: 410, xuat_qty: 350, ton_qty: 12220, nhap_val: 328000000, xuat_val: 280000000, ton_val: 1816000000 },
  { label: 'T6', nhap_qty: 350, xuat_qty: 400, ton_qty: 12170, nhap_val: 280000000, xuat_val: 320000000, ton_val: 1776000000 },
  { label: 'T7', nhap_qty: 480, xuat_qty: 510, ton_qty: 12140, nhap_val: 384000000, xuat_val: 408000000, ton_val: 1752000000 },
  { label: 'T8', nhap_qty: 550, xuat_qty: 490, ton_qty: 12200, nhap_val: 440000000, xuat_val: 392000000, ton_val: 1800000000 },
  { label: 'T9', nhap_qty: 420, xuat_qty: 380, ton_qty: 12240, nhap_val: 336000000, xuat_val: 304000000, ton_val: 1832000000 },
  { label: 'T10', nhap_qty: 390, xuat_qty: 430, ton_qty: 12200, nhap_val: 312000000, xuat_val: 344000000, ton_val: 1800000000 },
  { label: 'T11', nhap_qty: 510, xuat_qty: 460, ton_qty: 12250, nhap_val: 408000000, xuat_val: 368000000, ton_val: 1840000000 },
  { label: 'T12', nhap_qty: 600, xuat_qty: 400, ton_qty: 12450, nhap_val: 480000000, xuat_val: 320000000, ton_val: 1850000000 },
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

// --- Sub-components ---

function InfoCards() {
  return (
    <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
      {infoCards.map((card) => {
        const isUp = card.change >= 0
        const changeColor = card.inverted
          ? (isUp ? 'text-red-500' : 'text-emerald-500')
          : (isUp ? 'text-emerald-500' : 'text-red-500')

        return (
          <Card key={card.title}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
              <card.icon className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {card.value}
                {card.unit && <span className='ml-1 text-sm font-normal text-muted-foreground'>{card.unit}</span>}
              </div>
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

type CategoryMetric = 'quantity' | 'value'

const categoryMetricLabels: Record<CategoryMetric, string> = {
  quantity: 'Số lượng',
  value: 'Giá trị',
}

function CategoryPieCard() {
  const [metric, setMetric] = useState<CategoryMetric>('quantity')
  const total = categoryData.reduce((s, i) => s + i[metric], 0)
  const fmt = metric === 'quantity' ? formatNumber : formatVND
  const unit = metric === 'quantity' ? 'SP' : ''

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-sm'>Phân loại theo danh mục</CardTitle>
            <CardDescription className='text-xs'>Tồn kho theo {categoryMetricLabels[metric].toLowerCase()} từng nhóm sản phẩm</CardDescription>
          </div>
          <div className='inline-flex h-7 items-center rounded-md bg-muted p-0.5 text-muted-foreground'>
            {(Object.keys(categoryMetricLabels) as CategoryMetric[]).map((key) => (
              <button
                key={key}
                onClick={() => setMetric(key)}
                className={cn(
                  'inline-flex h-6 items-center rounded px-2 text-[11px] font-medium transition-colors',
                  metric === key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'hover:text-foreground'
                )}
              >
                {categoryMetricLabels[key]}
              </button>
            ))}
          </div>
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
                formatter={(val, _, props) => [
                  `${fmt((val ?? 0) as number)}${unit ? ` ${unit}` : ''} (${Math.round(((val ?? 0) as number / total) * 100)}%)`,
                  (props as { payload: { name: string } }).payload.name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className='flex-1 space-y-2.5'>
            {categoryData.map((item, index) => {
              const val = item[metric]
              return (
                <div key={item.name} className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <div className='h-2.5 w-2.5 rounded-full bg-foreground' style={{ opacity: PIE_OPACITIES[index] }} />
                    <span className='text-xs text-muted-foreground'>{item.name}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs font-medium'>{fmt(val)}{unit ? ` ${unit}` : ''}</span>
                    <span className='text-xs text-muted-foreground'>({Math.round((val / total) * 100)}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

type StaleMetric = 'days' | 'value'

const staleMetricLabels: Record<StaleMetric, string> = {
  days: 'Số ngày',
  value: 'Giá trị',
}

function TopStaleBatchesCard() {
  const [metric, setMetric] = useState<StaleMetric>('days')
  const fmt = metric === 'days' ? (v: number) => `${v} ngày` : formatVND

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-sm'>Top lô hàng tồn lâu</CardTitle>
            <CardDescription className='text-xs'>Các lô hàng tồn kho lâu nhất chưa bán hết</CardDescription>
          </div>
          <div className='inline-flex h-7 items-center rounded-md bg-muted p-0.5 text-muted-foreground'>
            {(Object.keys(staleMetricLabels) as StaleMetric[]).map((key) => (
              <button
                key={key}
                onClick={() => setMetric(key)}
                className={cn(
                  'inline-flex h-6 items-center rounded px-2 text-[11px] font-medium transition-colors',
                  metric === key
                    ? 'bg-background text-foreground shadow-sm'
                    : 'hover:text-foreground'
                )}
              >
                {staleMetricLabels[key]}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={280}>
          <BarChart data={topStaleBatches} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
            <XAxis
              dataKey='name'
              stroke='hsl(var(--muted-foreground))'
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-25}
              textAnchor='end'
              height={50}
              tickFormatter={(v: string) => v.split(' – ')[0]}
            />
            <YAxis stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => metric === 'days' ? `${v}d` : formatVND(v)} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(val) => [fmt((val ?? 0) as number), staleMetricLabels[metric]]}
              labelFormatter={(label) => `${label}`}
            />
            <Bar dataKey={metric} fill='hsl(var(--destructive))' radius={[4, 4, 0, 0]} maxBarSize={36}>
              {topStaleBatches.map((_, index) => (
                <Cell key={index} fillOpacity={1 - index * 0.09} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function SmartAlertCard() {
  return (
    <div className='space-y-2'>
      <div className='flex items-center gap-2 px-1'>
        <AlertTriangle className='h-4 w-4 text-muted-foreground' />
        <h3 className='text-sm font-semibold'>Cảnh báo thông minh</h3>
        <span className='text-xs text-muted-foreground'>Phân tích tốc độ bán vs hạn sử dụng</span>
      </div>
      <div className='flex gap-3 overflow-x-auto pb-2'>
        {smartAlerts.map((alert) => {
          const monthsNeeded = Math.ceil(alert.remaining / alert.avgSalesPerMonth)
          const canSellInTime = monthsNeeded <= alert.expiryMonths
          const surplus = alert.remaining - (alert.avgSalesPerMonth * alert.expiryMonths)

          return (
            <Card key={`${alert.product}-${alert.batch}`} className='w-[280px] shrink-0'>
              <CardContent className='flex h-full flex-col gap-2 p-4'>
                <div className='flex items-center gap-2'>
                  <span className={cn(
                    'rounded-md px-1.5 py-0.5 text-[10px] font-medium',
                    alert.severity === 'critical'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-muted text-muted-foreground',
                  )}>
                    {alert.severity === 'critical' ? 'Nghiêm trọng' : 'Cảnh báo'}
                  </span>
                  <span className='text-[10px] text-muted-foreground'>{alert.batch}</span>
                </div>
                <p className='text-sm font-medium leading-snug'>{alert.product}</p>
                <p className='text-xs text-muted-foreground leading-relaxed flex-1'>
                  {canSellInTime
                    ? 'Cần đẩy nhanh tiêu thụ, tồn kho cao so với tốc độ bán'
                    : `Dư ~${surplus} ${alert.unit}, không bán hết kịp trước hạn`}
                </p>
                <div className='flex items-center justify-between text-[10px] text-muted-foreground'>
                  <span>Còn {alert.remaining} {alert.unit} · {alert.expiryMonths}th</span>
                  <span>{alert.avgSalesPerMonth} {alert.unit}/th</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function DeadCapitalRatioCard() {
  const dataWithRatio = deadCapitalRatioData.map((d) => ({
    ...d,
    ratio: parseFloat(((d.dead / d.total) * 100).toFixed(1)),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-sm'>Tỉ lệ vốn đọng / Tổng giá trị kho</CardTitle>
        <CardDescription className='text-xs'>Biến động tỉ lệ vốn đọng theo thời gian</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={280}>
          <AreaChart data={dataWithRatio} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
            <defs>
              <linearGradient id='colorDeadRatio' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='hsl(var(--destructive))' stopOpacity={0.3} />
                <stop offset='95%' stopColor='hsl(var(--destructive))' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
            <XAxis dataKey='label' stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} domain={[0, 'auto']} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value, _name, props) => {
                const p = props.payload as { total: number; dead: number }
                return [`${value}% (${formatVND(p.dead)} / ${formatVND(p.total)})`, 'Tỉ lệ vốn đọng']
              }}
            />
            <Area
              type='monotone'
              dataKey='ratio'
              name='Tỉ lệ vốn đọng'
              stroke='hsl(var(--destructive))'
              strokeWidth={2}
              fill='url(#colorDeadRatio)'
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

type FlowMetric = 'quantity' | 'value'

const flowMetricLabels: Record<FlowMetric, string> = {
  quantity: 'Số lượng',
  value: 'Giá trị',
}

function FlowMetricSwitcher({ metric, onChange }: { metric: FlowMetric; onChange: (v: FlowMetric) => void }) {
  return (
    <div className='inline-flex h-7 items-center rounded-md bg-muted p-0.5 text-muted-foreground'>
      {(Object.keys(flowMetricLabels) as FlowMetric[]).map((key) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={cn(
            'inline-flex h-6 items-center rounded px-2 text-[11px] font-medium transition-colors',
            metric === key
              ? 'bg-background text-foreground shadow-sm'
              : 'hover:text-foreground'
          )}
        >
          {flowMetricLabels[key]}
        </button>
      ))}
    </div>
  )
}

function InOutFlowCard({ metric, setMetric }: { metric: FlowMetric; setMetric: (v: FlowMetric) => void }) {
  const nhapKey = metric === 'quantity' ? 'nhap_qty' : 'nhap_val'
  const xuatKey = metric === 'quantity' ? 'xuat_qty' : 'xuat_val'
  const fmt = metric === 'quantity' ? formatNumber : formatVND

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-sm'>Nhập – Xuất</CardTitle>
            <CardDescription className='text-xs'>
              {metric === 'quantity' ? 'Số lượng' : 'Giá trị'} nhập và xuất theo thời gian
            </CardDescription>
          </div>
          <FlowMetricSwitcher metric={metric} onChange={setMetric} />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={260}>
          <AreaChart data={flowData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
            <defs>
              <linearGradient id='colorNhap' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='hsl(142 76% 36%)' stopOpacity={0.3} />
                <stop offset='95%' stopColor='hsl(142 76% 36%)' stopOpacity={0} />
              </linearGradient>
              <linearGradient id='colorXuat' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='hsl(var(--destructive))' stopOpacity={0.3} />
                <stop offset='95%' stopColor='hsl(var(--destructive))' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
            <XAxis dataKey='label' stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v)} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [fmt((value ?? 0) as number), name]} />
            <Legend />
            <Area type='monotone' dataKey={nhapKey} name='Nhập' stroke='hsl(142 76% 36%)' strokeWidth={2} fill='url(#colorNhap)' dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Area type='monotone' dataKey={xuatKey} name='Xuất' stroke='hsl(var(--destructive))' strokeWidth={2} fill='url(#colorXuat)' dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function StockFlowCard({ metric, setMetric }: { metric: FlowMetric; setMetric: (v: FlowMetric) => void }) {
  const tonKey = metric === 'quantity' ? 'ton_qty' : 'ton_val'
  const fmt = metric === 'quantity' ? formatNumber : formatVND

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-sm'>Tồn kho</CardTitle>
            <CardDescription className='text-xs'>
              Biến động tồn kho theo {metric === 'quantity' ? 'số lượng' : 'giá trị'}
            </CardDescription>
          </div>
          <FlowMetricSwitcher metric={metric} onChange={setMetric} />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={260}>
          <AreaChart data={flowData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
            <defs>
              <linearGradient id='colorTon' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor='hsl(var(--primary))' stopOpacity={0.3} />
                <stop offset='95%' stopColor='hsl(var(--primary))' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
            <XAxis dataKey='label' stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v)} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [fmt((value ?? 0) as number), name]} />
            <Legend />
            <Area type='monotone' dataKey={tonKey} name='Tồn' stroke='hsl(var(--primary))' strokeWidth={2} fill='url(#colorTon)' dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function InventoryFlowCards() {
  const [metric, setMetric] = useState<FlowMetric>('quantity')

  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <InOutFlowCard metric={metric} setMetric={setMetric} />
      <StockFlowCard metric={metric} setMetric={setMetric} />
    </div>
  )
}

// --- Main ---

export function InventoryAnalysis() {
  return (
    <div className='space-y-4'>
      <InfoCards />

      <SmartAlertCard />

      <div className='grid gap-4 md:grid-cols-2'>
        <CategoryPieCard />
        <TopStaleBatchesCard />
      </div>

      <DeadCapitalRatioCard />

      <InventoryFlowCards />
    </div>
  )
}
