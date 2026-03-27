import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useUser } from '@/client/provider'
import { useLocationContext } from '@/context/location-provider'
import {
  getCategoriesByInventoriesQueryOptions,
  getTopStaleBatchesQueryOptions,
  getDeadValueInventoryQueryOptions,
  getPotentialLossInventoryQueryOptions,
  getLowStockInventoryQueryOptions,
} from '@/client/queries'
import {
  Ban,
  PackageSearch,
  ShieldAlert,
  ArrowRight,
  Lightbulb,
  Loader2,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

// --- Mock data ---

const infoCardsMeta = [
  {
    title: 'Giá trị vốn đọng',
    subtitle: 'Tổng giá trị hàng tồn không bán được',
    description: (days: number) => `SP không bán được trong ${days} ngày`,
    icon: Ban,
  },
  {
    title: 'Thất thoát tiềm năng',
    subtitle: 'Giá trị hàng sắp hết hạn',
    description: (days: number) => `lô hết hạn trong ${days} ngày tới`,
    icon: ShieldAlert,
  },
  {
    title: 'Sản phẩm sắp hết tồn kho',
    subtitle: 'Cần nhập thêm hàng sớm',
    description: (days: number) => `dự kiến hết hàng trong ${days} ngày tới`,
    icon: PackageSearch,
  },
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

import type {
  DeadValueInventoryItem,
  PotentialLossInventoryItem,
  LowStockInventoryItem,
} from '@/services/supabase/database/repo/dashboardReportRepo'

function DeadValueTable({ data }: { data: DeadValueInventoryItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sản phẩm</TableHead>
          <TableHead className='text-right'>SL tồn</TableHead>
          <TableHead className='text-right'>Giá vốn</TableHead>
          <TableHead className='text-right'>Tổng giá trị</TableHead>
          <TableHead className='text-right'>Bán lần cuối</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((b) => (
          <TableRow key={b.productId}>
            <TableCell className='font-medium'>{b.productName}</TableCell>
            <TableCell className='text-right'>{formatNumber(b.totalQuantity)} {b.productUnitName}</TableCell>
            <TableCell className='text-right'>{formatVND(b.averageCostPrice)}</TableCell>
            <TableCell className='text-right'>{formatVND(b.totalInventoryValue)}</TableCell>
            <TableCell className='text-right'>{b.lastSoldAt ? new Date(b.lastSoldAt).toLocaleDateString('vi-VN') : '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function PotentialLossTable({ data }: { data: PotentialLossInventoryItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sản phẩm</TableHead>
          <TableHead>Lô</TableHead>
          <TableHead className='text-right'>SL tồn</TableHead>
          <TableHead className='text-right'>Giá trị thất thoát</TableHead>
          <TableHead className='text-right'>Ngày hết hạn</TableHead>
          <TableHead className='text-right'>Còn lại</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((b) => (
          <TableRow key={b.batchId}>
            <TableCell className='font-medium'>{b.productName}</TableCell>
            <TableCell>{b.batchCode}</TableCell>
            <TableCell className='text-right'>{formatNumber(b.quantity)} {b.productUnitName}</TableCell>
            <TableCell className='text-right'>{formatVND(b.potentialLossValue)}</TableCell>
            <TableCell className='text-right'>{b.expiryDate ? new Date(b.expiryDate).toLocaleDateString('vi-VN') : '—'}</TableCell>
            <TableCell className='text-right'>{b.daysUntilExpiry} ngày</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function LowStockTable({ data }: { data: LowStockInventoryItem[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Sản phẩm</TableHead>
          <TableHead className='text-right'>SL tồn</TableHead>
          <TableHead className='text-right'>Bán TB/ngày</TableHead>
          <TableHead className='text-right'>Dự kiến hết</TableHead>
          <TableHead className='text-right'>Giá vốn</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((b) => (
          <TableRow key={b.productId}>
            <TableCell className='font-medium'>{b.productName}</TableCell>
            <TableCell className='text-right'>{formatNumber(b.totalQuantity)} {b.productUnitName}</TableCell>
            <TableCell className='text-right'>{b.avgDailySales}</TableCell>
            <TableCell className='text-right'>{b.estimatedDaysOfStock} ngày</TableCell>
            <TableCell className='text-right'>{formatVND(b.averageCostPrice)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function InfoCards({ days }: { days: number }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()

  const { data: deadValue, isLoading: loadingDead } = useQuery({
    ...getDeadValueInventoryQueryOptions({
      locationId: selectedLocationId,
      days,
    }),
    enabled: !!user,
  })

  const { data: potentialLoss, isLoading: loadingLoss } = useQuery({
    ...getPotentialLossInventoryQueryOptions({
      locationId: selectedLocationId,
      days,
    }),
    enabled: !!user,
  })

  const { data: lowStock, isLoading: loadingLow } = useQuery({
    ...getLowStockInventoryQueryOptions({
      locationId: selectedLocationId,
      days,
    }),
    enabled: !!user,
  })

  const deadValueTotal = useMemo(
    () => (deadValue ?? []).reduce((s, i) => s + i.totalInventoryValue, 0),
    [deadValue]
  )
  const potentialLossTotal = useMemo(
    () => (potentialLoss ?? []).reduce((s, i) => s + i.potentialLossValue, 0),
    [potentialLoss]
  )
  const lowStockCount = (lowStock ?? []).length

  const isLoading = loadingDead || loadingLoss || loadingLow

  const cards = [
    {
      ...infoCardsMeta[0],
      value: formatVND(deadValueTotal),
      unit: '',
      data: deadValue ?? [],
    },
    {
      ...infoCardsMeta[1],
      value: formatVND(potentialLossTotal),
      unit: '',
      data: potentialLoss ?? [],
    },
    {
      ...infoCardsMeta[2],
      value: String(lowStockCount),
      unit: 'sản phẩm',
      data: lowStock ?? [],
    },
  ]

  return (
    <div className='space-y-4'>
      <div className='grid gap-4 md:grid-cols-3'>
        {cards.map((card, index) => (
          <Card key={card.title} className='flex flex-col'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <div>
                <CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
                <CardDescription className='text-xs'>{card.subtitle}</CardDescription>
              </div>
              <card.icon className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent className='mt-auto'>
              {isLoading ? (
                <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
              ) : (
                <div className='text-3xl font-bold'>
                  {card.value}
                  {card.unit && <span className='ml-1 text-sm font-normal text-muted-foreground'>{card.unit}</span>}
                </div>
              )}
            </CardContent>
            <CardFooter className='justify-end pt-0'>
              <p className='text-xs text-muted-foreground mr-auto'>{card.description(days)}</p>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className='inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors'
              >
                {openIndex === index ? 'Ẩn' : 'Xem chi tiết'}
                <ArrowRight className={cn('h-3 w-3 transition-transform', openIndex === index && 'rotate-90')} />
              </button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {openIndex !== null && (() => {
        const card = cards[openIndex]
        return (
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-sm'>{card.title}</CardTitle>
                  <CardDescription className='text-xs'>{card.subtitle}</CardDescription>
                </div>
                <button
                  onClick={() => setOpenIndex(null)}
                  className='inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-muted transition-colors'
                >
                  Đóng
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {openIndex === 0 && <DeadValueTable data={deadValue ?? []} />}
              {openIndex === 1 && <PotentialLossTable data={potentialLoss ?? []} />}
              {openIndex === 2 && <LowStockTable data={lowStock ?? []} />}
            </CardContent>
          </Card>
        )
      })()}
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
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()

  const { data: categories, isLoading } = useQuery({
    ...getCategoriesByInventoriesQueryOptions({
      locationId: selectedLocationId,
    }),
    enabled: !!user,
  })

  const chartData = useMemo(() => {
    const all = categories ?? []
    if (all.length <= 5) return all
    const sorted = [...all].sort((a, b) => b[metric] - a[metric])
    const top4 = sorted.slice(0, 4)
    const rest = sorted.slice(4)
    const other = {
      id: '__other__',
      name: 'Danh mục khác',
      quantity: rest.reduce((s, i) => s + i.quantity, 0),
      value: rest.reduce((s, i) => s + i.value, 0),
    }
    return [...top4, other]
  }, [categories, metric])

  const total = chartData.reduce((s, i) => s + i[metric], 0)
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
        {isLoading ? (
          <div className='flex items-center justify-center h-40'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : chartData.length === 0 ? (
          <div className='flex items-center justify-center h-40 text-sm text-muted-foreground'>
            Không có dữ liệu
          </div>
        ) : (
          <div className='flex items-center gap-6'>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx='50%'
                  cy='50%'
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey={metric}
                  nameKey='name'
                  stroke='hsl(var(--background))'
                  strokeWidth={2}
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill='hsl(var(--foreground))' fillOpacity={PIE_OPACITIES[index % PIE_OPACITIES.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(val, _, props) => [
                    `${fmt((val ?? 0) as number)}${unit ? ` ${unit}` : ''} (${total > 0 ? Math.round(((val ?? 0) as number / total) * 100) : 0}%)`,
                    (props as { payload: { name: string } }).payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className='flex-1 space-y-2.5'>
              {chartData.map((item, index) => {
                const val = item[metric]
                return (
                  <div key={item.id} className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='h-2.5 w-2.5 rounded-full bg-foreground' style={{ opacity: PIE_OPACITIES[index % PIE_OPACITIES.length] }} />
                      <span className='text-xs text-muted-foreground'>{item.name}</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <span className='text-xs font-medium'>{fmt(val)}{unit ? ` ${unit}` : ''}</span>
                      <span className='text-xs text-muted-foreground'>({total > 0 ? Math.round((val / total) * 100) : 0}%)</span>
                    </div>
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

function TopStaleBatchesCard() {
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()

  const { data: staleBatches, isLoading } = useQuery({
    ...getTopStaleBatchesQueryOptions({
      tenantId: user?.profile?.tenant_id ?? '',
      locationId: selectedLocationId,
      limit: 8,
    }),
    enabled: !!user?.profile?.tenant_id,
  })

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className='text-sm'>Top lô hàng tồn lâu</CardTitle>
          <CardDescription className='text-xs'>Các lô hàng tồn kho lâu nhất chưa bán hết</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex items-center justify-center h-[280px]'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : !staleBatches?.length ? (
          <div className='flex items-center justify-center h-[280px] text-sm text-muted-foreground'>
            Không có dữ liệu
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={280}>
            <BarChart data={staleBatches} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
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
                tickFormatter={(_, index) => {
                  const item = staleBatches[index]
                  const label = `${item.batch} - ${item.name}`
                  return label.length > 20 ? `${label.slice(0, 20)}…` : label
                }}
              />
              <YAxis stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}d`} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(val, _, props) => {
                  const item = (props as { payload: { quantity: number; value: number } }).payload
                  return [
                    `${val} ngày (SL: ${formatNumber(item.quantity)}, GT: ${formatVND(item.value)})`,
                    'Tồn kho',
                  ]
                }}
                labelFormatter={(_, payload) => {
                  const item = (payload[0]?.payload ?? {}) as { name: string; batch: string }
                  return `${item.name} – ${item.batch}`
                }}
              />
              <Bar dataKey='days' fill='hsl(var(--destructive))' radius={[4, 4, 0, 0]} maxBarSize={36}>
                {staleBatches.map((_, index) => (
                  <Cell key={index} fillOpacity={1 - index * 0.09} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
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

function InventoryFlowCard() {
  const [metric, setMetric] = useState<FlowMetric>('quantity')
  const nhapKey = metric === 'quantity' ? 'nhap_qty' : 'nhap_val'
  const xuatKey = metric === 'quantity' ? 'xuat_qty' : 'xuat_val'
  const tonKey = metric === 'quantity' ? 'ton_qty' : 'ton_val'
  const fmt = metric === 'quantity' ? formatNumber : formatVND

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-sm'>Nhập – Xuất – Tồn kho</CardTitle>
            <CardDescription className='text-xs'>Biến động {metric === 'quantity' ? 'số lượng' : 'giá trị'} nhập, xuất và tồn kho theo thời gian</CardDescription>
          </div>
          <FlowMetricSwitcher metric={metric} onChange={setMetric} />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={280}>
          <LineChart data={flowData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
            <XAxis dataKey='label' stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v)} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [fmt((value ?? 0) as number), name]} />
            <Legend />
            <Line type='monotone' dataKey={nhapKey} name='Nhập' stroke='hsl(142 76% 36%)' strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type='monotone' dataKey={xuatKey} name='Xuất' stroke='var(--destructive)' strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type='monotone' dataKey={tonKey} name='Tồn' stroke='var(--primary)' strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
      <CardFooter className='border-t pt-4'>
        <div className='flex gap-2 text-xs text-muted-foreground'>
          <Lightbulb className='h-4 w-4 shrink-0 text-amber-500' />
          <p>Nhập & Xuất nên bám sát nhau và mỗi đường chiếm khoảng 20-30% so với Tồn kho. Nếu Nhập vượt Xuất &gt;15% liên tục 2-3 tháng, cân nhắc giảm nhập hoặc đẩy hàng.</p>
        </div>
      </CardFooter>
    </Card>
  )
}

// --- Main ---

export function InventoryAnalysis({ days }: { days: number }) {
  return (
    <div className='space-y-4'>
      <InventoryFlowCard />
      <InfoCards days={days} />
      <div className='grid gap-4 md:grid-cols-2'>
        <CategoryPieCard />
        <TopStaleBatchesCard />
      </div>
    </div>
  )
}
