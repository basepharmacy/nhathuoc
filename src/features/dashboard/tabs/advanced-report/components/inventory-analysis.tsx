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
  getInventoryValueByMonthQueryOptions,
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
import {
  DUMMY_DEAD_VALUE,
  DUMMY_POTENTIAL_LOSS,
  DUMMY_LOW_STOCK,
  DUMMY_CATEGORIES_INV,
  DUMMY_STALE_BATCHES,
  DUMMY_FLOW_DATA,
} from '../dummy/inventory-analysis'

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

function InfoCards({ days, isDummy }: { days: number; isDummy: boolean }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()

  const { data: deadValue, isLoading: loadingDead } = useQuery({
    ...getDeadValueInventoryQueryOptions({
      locationId: selectedLocationId,
      days,
    }),
    enabled: !!user && !isDummy,
  })

  const { data: potentialLoss, isLoading: loadingLoss } = useQuery({
    ...getPotentialLossInventoryQueryOptions({
      locationId: selectedLocationId,
      days,
    }),
    enabled: !!user && !isDummy,
  })

  const { data: lowStock, isLoading: loadingLow } = useQuery({
    ...getLowStockInventoryQueryOptions({
      locationId: selectedLocationId,
      days,
    }),
    enabled: !!user && !isDummy,
  })

  const resolvedDead = isDummy ? DUMMY_DEAD_VALUE : deadValue
  const resolvedLoss = isDummy ? DUMMY_POTENTIAL_LOSS : potentialLoss
  const resolvedLow = isDummy ? DUMMY_LOW_STOCK : lowStock

  const deadValueTotal = useMemo(
    () => (resolvedDead ?? []).reduce((s, i) => s + i.totalInventoryValue, 0),
    [resolvedDead]
  )
  const potentialLossTotal = useMemo(
    () => (resolvedLoss ?? []).reduce((s, i) => s + i.potentialLossValue, 0),
    [resolvedLoss]
  )
  const lowStockCount = (resolvedLow ?? []).length

  const isLoading = !isDummy && (loadingDead || loadingLoss || loadingLow)

  const cards = [
    {
      ...infoCardsMeta[0],
      value: formatVND(deadValueTotal),
      unit: '',
      data: resolvedDead ?? [],
    },
    {
      ...infoCardsMeta[1],
      value: formatVND(potentialLossTotal),
      unit: '',
      data: resolvedLoss ?? [],
    },
    {
      ...infoCardsMeta[2],
      value: String(lowStockCount),
      unit: 'sản phẩm',
      data: resolvedLow ?? [],
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
              {openIndex === 0 && <DeadValueTable data={resolvedDead ?? []} />}
              {openIndex === 1 && <PotentialLossTable data={resolvedLoss ?? []} />}
              {openIndex === 2 && <LowStockTable data={resolvedLow ?? []} />}
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

function CategoryPieCard({ isDummy }: { isDummy: boolean }) {
  const [metric, setMetric] = useState<CategoryMetric>('quantity')
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()

  const { data: categories, isLoading } = useQuery({
    ...getCategoriesByInventoriesQueryOptions({
      locationId: selectedLocationId,
    }),
    enabled: !!user && !isDummy,
  })

  const resolvedCategories = isDummy ? DUMMY_CATEGORIES_INV : (categories ?? [])

  const chartData = useMemo(() => {
    if (resolvedCategories.length <= 5) return resolvedCategories
    const sorted = [...resolvedCategories].sort((a, b) => b[metric] - a[metric])
    const top4 = sorted.slice(0, 4)
    const rest = sorted.slice(4)
    const other = {
      id: '__other__',
      name: 'Danh mục khác',
      quantity: rest.reduce((s, i) => s + i.quantity, 0),
      value: rest.reduce((s, i) => s + i.value, 0),
    }
    return [...top4, other]
  }, [resolvedCategories, metric])

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

function TopStaleBatchesCard({ isDummy }: { isDummy: boolean }) {
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()

  const { data: staleBatches, isLoading } = useQuery({
    ...getTopStaleBatchesQueryOptions({
      tenantId: user?.profile?.tenant_id ?? '',
      locationId: selectedLocationId,
      limit: 8,
    }),
    enabled: !!user?.profile?.tenant_id && !isDummy,
  })

  const resolvedBatches = isDummy ? DUMMY_STALE_BATCHES : staleBatches

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
        ) : !resolvedBatches?.length ? (
          <div className='flex items-center justify-center h-[280px] text-sm text-muted-foreground'>
            Không có dữ liệu
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={280}>
            <BarChart data={resolvedBatches} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
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
                  const item = resolvedBatches[index]
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
                {resolvedBatches.map((_, index) => (
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

function InventoryFlowCard({ isDummy }: { isDummy: boolean }) {
  const [metric, setMetric] = useState<FlowMetric>('quantity')
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()

  const { fromDate, toDate } = useMemo(() => {
    const now = new Date()
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0) // last day of current month
    const from = new Date(now.getFullYear(), now.getMonth() - 11, 1) // first day of 12 months ago
    return {
      fromDate: from.toISOString().slice(0, 10),
      toDate: to.toISOString().slice(0, 10),
    }
  }, [])

  const { data: flowDataApi, isLoading } = useQuery({
    ...getInventoryValueByMonthQueryOptions({
      locationId: selectedLocationId,
      fromDate,
      toDate,
    }),
    enabled: !!user && !isDummy,
  })

  const flowData = isDummy ? DUMMY_FLOW_DATA : (flowDataApi ?? [])

  const nhapKey = metric === 'quantity' ? 'totalImportQuantity' : 'totalImportValue'
  const xuatKey = metric === 'quantity' ? 'totalExportQuantity' : 'totalExportValue'
  const tonKey = metric === 'quantity' ? 'totalQuantity' : 'totalInventoryValue'
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
        {!isDummy && isLoading ? (
          <div className='flex items-center justify-center h-[280px]'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : flowData.length === 0 ? (
          <div className='flex items-center justify-center h-[280px] text-sm text-muted-foreground'>
            Không có dữ liệu
          </div>
        ) : (
        <ResponsiveContainer width='100%' height={280}>
          <LineChart data={flowData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
            <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
            <XAxis dataKey='snapshotMonth' stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => fmt(v)} />
            <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [fmt((value ?? 0) as number), name]} />
            <Legend />
            <Line type='monotone' dataKey={nhapKey} name='Nhập' stroke='hsl(142 76% 36%)' strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type='monotone' dataKey={xuatKey} name='Xuất' stroke='var(--destructive)' strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type='monotone' dataKey={tonKey} name='Tồn' stroke='var(--primary)' strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
        )}
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

export function InventoryAnalysis({ days, isDummy }: { days: number; isDummy: boolean }) {
  return (
    <div className='space-y-4'>
      <InventoryFlowCard isDummy={isDummy} />
      <InfoCards days={days} isDummy={isDummy} />
      <div className='grid gap-4 md:grid-cols-2'>
        <CategoryPieCard isDummy={isDummy} />
        <TopStaleBatchesCard isDummy={isDummy} />
      </div>
    </div>
  )
}
