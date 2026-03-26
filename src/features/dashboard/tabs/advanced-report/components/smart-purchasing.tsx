import { useState } from 'react'
import {
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// --- Mock data ---

const suggestedProducts = [
  { name: 'Paracetamol 500mg', current: 45, suggested: 200, priority: 'urgent', avgSale: 25, daysLeft: 1.8, supplier: 'NCC Pharma' },
  { name: 'Amoxicillin 500mg', current: 60, suggested: 150, priority: 'urgent', avgSale: 18, daysLeft: 3.3, supplier: 'DHG Pharma' },
  { name: 'Vitamin C 1000mg', current: 80, suggested: 180, priority: 'high', avgSale: 12, daysLeft: 6.7, supplier: 'NCC Pharma' },
  { name: 'Men vi sinh Bio-acimin', current: 35, suggested: 100, priority: 'high', avgSale: 8, daysLeft: 4.4, supplier: 'Bidiphar' },
  { name: 'Omega-3 Fish Oil', current: 50, suggested: 120, priority: 'medium', avgSale: 6, daysLeft: 8.3, supplier: 'NCC Pharma' },
  { name: 'Thuốc ho Bảo Thanh', current: 70, suggested: 100, priority: 'medium', avgSale: 5, daysLeft: 14, supplier: 'Traphaco' },
  { name: 'Calcium + D3', current: 40, suggested: 80, priority: 'low', avgSale: 3, daysLeft: 13.3, supplier: 'DHG Pharma' },
  { name: 'Centrum Multivitamin', current: 90, suggested: 60, priority: 'low', avgSale: 4, daysLeft: 22.5, supplier: 'NCC Pharma' },
]

const demandForecastDaily = [
  { label: 'T2', value: 85 },
  { label: 'T3', value: 92 },
  { label: 'T4', value: 78 },
  { label: 'T5', value: 105 },
  { label: 'T6', value: 118 },
  { label: 'T7', value: 145 },
  { label: 'CN', value: 132 },
]

const demandForecastWeekly = [
  { label: 'Tuần 1', value: 620 },
  { label: 'Tuần 2', value: 580 },
  { label: 'Tuần 3', value: 710 },
  { label: 'Tuần 4', value: 690 },
  { label: 'Tuần 5', value: 750 },
  { label: 'Tuần 6', value: 680 },
  { label: 'Tuần 7', value: 820 },
  { label: 'Tuần 8', value: 780 },
]

const demandTrendData = [
  { label: 'T1', actual: 520, predicted: 530 },
  { label: 'T2', actual: 580, predicted: 570 },
  { label: 'T3', actual: 610, predicted: 620 },
  { label: 'T4', actual: 550, predicted: 580 },
  { label: 'T5', actual: 690, predicted: 670 },
  { label: 'T6', actual: 720, predicted: 710 },
  { label: 'T7', actual: 680, predicted: 700 },
  { label: 'T8', actual: 750, predicted: 740 },
  { label: 'T9', actual: 710, predicted: 730 },
  { label: 'T10', actual: 780, predicted: 770 },
  { label: 'T11', actual: 820, predicted: 810 },
  { label: 'T12', actual: null, predicted: 860 },
]

const shouldBuyProducts = [
  { name: 'Paracetamol 500mg', reason: 'Tồn thấp, bán chạy', score: 95 },
  { name: 'Amoxicillin 500mg', reason: 'Sắp hết, nhu cầu tăng', score: 90 },
  { name: 'Vitamin C 1000mg', reason: 'Mùa cao điểm sắp tới', score: 85 },
  { name: 'Men vi sinh Bio-acimin', reason: 'Xu hướng tăng liên tục', score: 78 },
  { name: 'Thuốc ho Bảo Thanh', reason: 'Mùa lạnh, nhu cầu tăng', score: 72 },
]

const shouldNotBuyProducts = [
  { name: 'Kem chống nắng SPF50', reason: 'Tồn cao, bán chậm', score: 15 },
  { name: 'Nước muối Natri 0.9%', reason: 'Đã nhập nhiều kỳ trước', score: 20 },
  { name: 'Gel rửa tay khô', reason: 'Nhu cầu giảm mạnh', score: 22 },
  { name: 'Khẩu trang y tế', reason: 'Tồn kho quá lớn', score: 25 },
  { name: 'Vitamin E 400IU', reason: 'Lợi nhuận thấp, bán chậm', score: 30 },
]

const capitalDistribution = [
  { name: 'Cần nhập gấp', value: 45 },
  { name: 'Nên nhập', value: 25 },
  { name: 'Có thể hoãn', value: 18 },
  { name: 'Không nên nhập', value: 12 },
]

const quickOrderDrafts = [
  {
    supplier: 'NCC Pharma',
    items: 3,
    total: 85000000,
    products: ['Paracetamol 500mg', 'Vitamin C 1000mg', 'Omega-3 Fish Oil'],
  },
  {
    supplier: 'DHG Pharma',
    items: 2,
    total: 62000000,
    products: ['Amoxicillin 500mg', 'Calcium + D3'],
  },
  {
    supplier: 'Bidiphar',
    items: 1,
    total: 28000000,
    products: ['Men vi sinh Bio-acimin'],
  },
]

const PIE_OPACITIES = [1, 0.75, 0.5, 0.3]

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

const priorityConfig: Record<string, { label: string; color: string }> = {
  urgent: { label: 'Khẩn cấp', color: 'bg-red-500/15 text-red-600' },
  high: { label: 'Cao', color: 'bg-orange-500/15 text-orange-600' },
  medium: { label: 'Trung bình', color: 'bg-blue-500/15 text-blue-600' },
  low: { label: 'Thấp', color: 'bg-slate-500/15 text-slate-600' },
}

// --- Sub-components ---
function PurchaseSuggestionCard() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className='text-sm'>Gợi ý nhập hàng</CardTitle>
          <CardDescription className='text-xs'>Số lượng nên nhập & ưu tiên sản phẩm dựa trên dữ liệu bán hàng</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-2'>
          {suggestedProducts.map((product) => {
            const priority = priorityConfig[product.priority]
            return (
              <div
                key={product.name}
                className='flex items-center gap-3 rounded-lg border p-2.5'
              >
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2'>
                    <span className='truncate text-sm font-medium'>{product.name}</span>
                    <Badge variant='secondary' className={cn('shrink-0 text-[10px] px-1.5 py-0', priority.color)}>
                      {priority.label}
                    </Badge>
                  </div>
                  <div className='mt-1 flex items-center gap-3 text-xs text-muted-foreground'>
                    <span>Tồn: <strong className='text-foreground'>{product.current}</strong></span>
                    <span>Bán TB/ngày: <strong className='text-foreground'>{product.avgSale}</strong></span>
                    <span>Còn ~<strong className={cn('text-foreground', product.daysLeft <= 3 && 'text-red-500')}>{product.daysLeft}</strong> ngày</span>
                  </div>
                </div>
                <div className='text-right shrink-0'>
                  <div className='text-sm font-semibold text-primary'>+{product.suggested}</div>
                  <div className='text-[10px] text-muted-foreground'>{product.supplier}</div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

type DemandView = 'daily' | 'weekly'
type DemandTab = 'forecast' | 'trend'

const demandViewLabels: Record<DemandView, string> = {
  daily: 'Ngày',
  weekly: 'Tuần',
}

function DemandForecastCard() {
  const [view, setView] = useState<DemandView>('daily')
  const [tab, setTab] = useState<DemandTab>('forecast')
  const data = view === 'daily' ? demandForecastDaily : demandForecastWeekly

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle className='text-sm'>Dự đoán nhu cầu</CardTitle>
            <CardDescription className='text-xs'>
              {tab === 'forecast' ? 'Dự kiến số lượng bán ra' : 'Xu hướng nhu cầu thực tế vs dự đoán'}
            </CardDescription>
          </div>
          <div className='flex items-center gap-2'>
            <div className='inline-flex h-7 items-center rounded-md bg-muted p-0.5 text-muted-foreground'>
              {(['forecast', 'trend'] as DemandTab[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={cn(
                    'inline-flex h-6 items-center rounded px-2 text-[11px] font-medium transition-colors',
                    tab === key
                      ? 'bg-background text-foreground shadow-sm'
                      : 'hover:text-foreground'
                  )}
                >
                  {key === 'forecast' ? 'Dự báo' : 'Xu hướng'}
                </button>
              ))}
            </div>
            {tab === 'forecast' && (
              <div className='inline-flex h-7 items-center rounded-md bg-muted p-0.5 text-muted-foreground'>
                {(Object.keys(demandViewLabels) as DemandView[]).map((key) => (
                  <button
                    key={key}
                    onClick={() => setView(key)}
                    className={cn(
                      'inline-flex h-6 items-center rounded px-2 text-[11px] font-medium transition-colors',
                      view === key
                        ? 'bg-background text-foreground shadow-sm'
                        : 'hover:text-foreground'
                    )}
                  >
                    {demandViewLabels[key]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {tab === 'forecast' ? (
          <ResponsiveContainer width='100%' height={280}>
            <BarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
              <XAxis dataKey='label' stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(val) => [formatNumber((val ?? 0) as number), 'Dự kiến bán']} />
              <Bar dataKey='value' fill='hsl(var(--primary))' radius={[4, 4, 0, 0]} maxBarSize={36}>
                {data.map((_, index) => (
                  <Cell key={index} fillOpacity={1 - index * 0.06} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width='100%' height={280}>
            <AreaChart data={demandTrendData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
              <defs>
                <linearGradient id='colorActual' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='hsl(var(--primary))' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='hsl(var(--primary))' stopOpacity={0} />
                </linearGradient>
                <linearGradient id='colorPredicted' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor='hsl(142 76% 36%)' stopOpacity={0.3} />
                  <stop offset='95%' stopColor='hsl(142 76% 36%)' stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
              <XAxis dataKey='label' stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke='hsl(var(--muted-foreground))' fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => [formatNumber((value ?? 0) as number), name]} />
              <Legend />
              <Area type='monotone' dataKey='actual' name='Thực tế' stroke='hsl(var(--primary))' strokeWidth={2} fill='url(#colorActual)' dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls={false} />
              <Area type='monotone' dataKey='predicted' name='Dự đoán' stroke='hsl(142 76% 36%)' strokeWidth={2} fill='url(#colorPredicted)' dot={{ r: 3 }} activeDot={{ r: 5 }} strokeDasharray='5 5' />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

function CapitalOptimizationCard() {
  const total = capitalDistribution.reduce((s, i) => s + i.value, 0)

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className='text-sm'>Tối ưu vốn nhập hàng</CardTitle>
          <CardDescription className='text-xs'>Phân bổ ngân sách nhập hàng tối ưu</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className='flex items-center gap-6'>
          <ResponsiveContainer width={160} height={160}>
            <PieChart>
              <Pie
                data={capitalDistribution}
                cx='50%'
                cy='50%'
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey='value'
                stroke='hsl(var(--background))'
                strokeWidth={2}
              >
                {capitalDistribution.map((_, index) => (
                  <Cell key={index} fill='hsl(var(--foreground))' fillOpacity={PIE_OPACITIES[index]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(val, _, props) => [
                  `${val ?? 0}%`,
                  (props as { payload: { name: string } }).payload.name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className='flex-1 space-y-2.5'>
            {capitalDistribution.map((item, index) => (
              <div key={item.name} className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <div className='h-2.5 w-2.5 rounded-full bg-foreground' style={{ opacity: PIE_OPACITIES[index] }} />
                  <span className='text-xs text-muted-foreground'>{item.name}</span>
                </div>
                <span className='text-xs font-medium'>{Math.round((item.value / total) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ShouldBuyShouldNotCard() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className='text-sm'>Nên nhập vs Không nên nhập</CardTitle>
          <CardDescription className='text-xs'>Đề xuất dựa trên phân tích bán hàng, tồn kho & xu hướng</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid gap-4 md:grid-cols-2'>
          {/* Nên nhập */}
          <div className='space-y-2'>
            <div className='flex items-center gap-1.5 text-xs font-medium text-emerald-600'>
              <ThumbsUp className='h-3.5 w-3.5' />
              Nên nhập
            </div>
            {shouldBuyProducts.map((product) => (
              <div key={product.name} className='flex items-center gap-2 rounded-md border border-emerald-200/50 bg-emerald-50/50 p-2 dark:border-emerald-900/30 dark:bg-emerald-950/20'>
                <div className='min-w-0 flex-1'>
                  <div className='truncate text-xs font-medium'>{product.name}</div>
                  <div className='text-[10px] text-muted-foreground'>{product.reason}</div>
                </div>
                <div className='shrink-0 text-xs font-semibold text-emerald-600'>{product.score}%</div>
              </div>
            ))}
          </div>
          {/* Không nên nhập */}
          <div className='space-y-2'>
            <div className='flex items-center gap-1.5 text-xs font-medium text-red-600'>
              <ThumbsDown className='h-3.5 w-3.5' />
              Không nên nhập
            </div>
            {shouldNotBuyProducts.map((product) => (
              <div key={product.name} className='flex items-center gap-2 rounded-md border border-red-200/50 bg-red-50/50 p-2 dark:border-red-900/30 dark:bg-red-950/20'>
                <div className='min-w-0 flex-1'>
                  <div className='truncate text-xs font-medium'>{product.name}</div>
                  <div className='text-[10px] text-muted-foreground'>{product.reason}</div>
                </div>
                <div className='shrink-0 text-xs font-semibold text-red-600'>{product.score}%</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function QuickOrderCard() {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className='text-sm'>Tạo đơn nhanh</CardTitle>
          <CardDescription className='text-xs'>Đơn nhập hàng tự động điền sản phẩm & số lượng theo NCC</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {quickOrderDrafts.map((draft) => (
            <div
              key={draft.supplier}
              className='flex items-center gap-3 rounded-lg border p-3'
            >
              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium'>{draft.supplier}</span>
                  <Badge variant='secondary' className='text-[10px] px-1.5 py-0'>
                    {draft.items} sản phẩm
                  </Badge>
                </div>
                <div className='mt-1 text-xs text-muted-foreground'>
                  {draft.products.join(', ')}
                </div>
                <div className='mt-1 text-xs font-medium'>
                  Tổng: <span className='text-primary'>{formatVND(draft.total)}</span>
                </div>
              </div>
              <Button variant='outline' size='sm' className='shrink-0 gap-1 text-xs'>
                Tạo đơn
                <ChevronRight className='h-3 w-3' />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// --- Main ---

export function SmartPurchasing() {
  return (
    <div className='space-y-4'>
      <PurchaseSuggestionCard />

      <DemandForecastCard />

      <div className='grid gap-4 md:grid-cols-2'>
        <CapitalOptimizationCard />
        <ShouldBuyShouldNotCard />
      </div>

      <QuickOrderCard />
    </div>
  )
}
