import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ChevronRight,
  ShoppingCart,
  Banknote,
  CreditCard,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useUser } from '@/client/provider'
import { useLocationContext } from '@/context/location-provider'
import { getPurchasesStatisticsV2QueryOptions, getTopSuppliersQueryOptions, getLowStockInventoryQueryOptions } from '@/client/queries'
import type { TopSupplierType } from '@/services/supabase/database/repo/dashboardReportRepo'

const LOW_STOCK_DAYS = 30
const SUGGEST_STOCK_DAYS = 60

const supplierTabToType = {
  amount: 'by_order_amount',
  orders: 'by_orders',
  debt: 'by_debt',
} as const satisfies Record<string, TopSupplierType>

type SupplierTab = keyof typeof supplierTabToType

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

const priorityConfig: Record<string, { label: string; color: string }> = {
  urgent: { label: 'Cao', color: 'bg-red-500/15 text-red-600' },
  medium: { label: 'Trung bình', color: 'bg-blue-500/15 text-blue-600' },
  low: { label: 'Thấp', color: 'bg-slate-500/15 text-slate-600' },
}

// --- Sub-components ---
function getPriority(daysLeft: number): string {
  if (daysLeft <= 7) return 'high'
  if (daysLeft <= 15) return 'medium'
  return 'low'
}

function PurchaseSuggestionCard() {
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()

  const { data: lowStockItems = [], isLoading } = useQuery({
    ...getLowStockInventoryQueryOptions({
      locationId: selectedLocationId,
      days: LOW_STOCK_DAYS,
    }),
    enabled: !!user,
  })

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className='text-sm'>Gợi ý nhập hàng</CardTitle>
          <CardDescription className='text-xs'>Số lượng nên nhập & ưu tiên sản phẩm dựa trên dữ liệu bán hàng</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex h-[160px] items-center justify-center'>
            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
          </div>
        ) : lowStockItems.length === 0 ? (
          <div className='flex h-[160px] items-center justify-center text-xs text-muted-foreground'>
            Không có sản phẩm sắp hết hàng
          </div>
        ) : (
          <div className='space-y-2'>
            {lowStockItems.map((product) => {
              const priorityKey = getPriority(product.estimatedDaysOfStock)
              const priority = priorityConfig[priorityKey]
              const suggested = Math.max(0, Math.ceil(product.avgDailySales * SUGGEST_STOCK_DAYS - product.totalQuantity))
              return (
                <div
                  key={product.productId}
                  className='flex items-center gap-3 rounded-lg border p-2.5'
                >
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <span className='truncate text-sm font-medium'>{product.productName}</span>
                      <Badge variant='secondary' className={cn('shrink-0 text-[10px] px-1.5 py-0', priority.color)}>
                        {priority.label}
                      </Badge>
                    </div>
                    <div className='mt-1 flex items-center gap-3 text-xs text-muted-foreground'>
                      <span>Tồn: <strong className='text-foreground'>{product.totalQuantity}</strong></span>
                      <span>Bán TB/ngày: <strong className='text-foreground'>{product.avgDailySales.toFixed(1)}</strong></span>
                      <span>Còn ~<strong className={cn('text-foreground', product.estimatedDaysOfStock <= 3 && 'text-red-500')}>{product.estimatedDaysOfStock.toFixed(1)}</strong> ngày</span>
                    </div>
                  </div>
                  <div className='shrink-0 text-sm font-semibold text-primary'>+{suggested} {product.productUnitName}</div>
                  <Button size='sm' variant='outline' className='shrink-0'>
                    Nhập hàng
                    <ChevronRight className='h-3 w-3' />
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function SupplierPieCard({ purchasePeriodId }: { purchasePeriodId: string }) {
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()
  const [tab, setTab] = useState<SupplierTab>('amount')

  const { data: suppliers = [], isLoading } = useQuery({
    ...getTopSuppliersQueryOptions({
      locationId: selectedLocationId,
      type: supplierTabToType[tab],
      purchasePeriodId: purchasePeriodId ? Number(purchasePeriodId) : undefined,
    }),
    enabled: !!user,
  })

  const pieData: { name: string; value: number }[] = useMemo(() => {
    if (suppliers.length <= 5) return suppliers.map((s) => ({ name: s.name, value: s.statValue }))
    const top4 = suppliers.slice(0, 4).map((s) => ({ name: s.name, value: s.statValue }))
    const othersValue = suppliers.slice(4).reduce((s, i) => s + i.statValue, 0)
    return [...top4, { name: 'NCC khác', value: othersValue }]
  }, [suppliers])

  const total = pieData.reduce((s, i) => s + i.value, 0)

  return (
    <Card>
      <Tabs value={tab} onValueChange={(v) => setTab(v as SupplierTab)}>
        <CardHeader>
          <div className='flex items-center gap-4'>
            <div>
              <CardTitle className='text-sm'>Nhà cung cấp</CardTitle>
              <CardDescription className='text-xs'>Phân bổ theo nhà cung cấp</CardDescription>
            </div>
            <TabsList className='ml-auto shrink-0'>
              <TabsTrigger value='amount'>Giá trị</TabsTrigger>
              <TabsTrigger value='orders'>Đơn hàng</TabsTrigger>
              <TabsTrigger value='debt'>Công nợ</TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className='flex h-[160px] items-center justify-center'>
              <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
            </div>
          ) : pieData.length === 0 ? (
            <div className='flex h-[160px] items-center justify-center text-xs text-muted-foreground'>
              Không có dữ liệu
            </div>
          ) : (
            <div className='flex items-center gap-6'>
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx='50%'
                    cy='50%'
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey='value'
                    stroke='hsl(var(--background))'
                    strokeWidth={2}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill='hsl(var(--foreground))' fillOpacity={PIE_OPACITIES[index % PIE_OPACITIES.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(val, _, props) => [
                      tab === 'orders'
                        ? `${val ?? 0} đơn`
                        : formatVND(Number(val ?? 0)),
                      (props as { payload: { name: string } }).payload.name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className='flex-1 space-y-2.5'>
                {pieData.map((item, index) => (
                  <div key={item.name} className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <div className='h-2.5 w-2.5 rounded-full bg-foreground' style={{ opacity: PIE_OPACITIES[index % PIE_OPACITIES.length] }} />
                      <span className='text-xs text-muted-foreground truncate max-w-[120px]'>{item.name}</span>
                    </div>
                    <span className='text-xs font-medium'>
                      {total > 0 ? `${Math.round((item.value / total) * 100)}%` : '0%'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Tabs>
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

// --- InfoCards ---

function InfoCards({ purchasePeriodId }: { purchasePeriodId: string }) {
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()

  const { data, isLoading } = useQuery({
    ...getPurchasesStatisticsV2QueryOptions({
      locationId: selectedLocationId,
      purchasePeriodId: purchasePeriodId ? Number(purchasePeriodId) : undefined,
    }),
    enabled: !!user,
  })

  const cards = [
    {
      title: 'Tổng đơn nhập',
      value: data?.totalOrders ?? 0,
      format: (v: number) => v.toLocaleString('vi-VN'),
      icon: ShoppingCart,
    },
    {
      title: 'Tổng tiền nhập',
      value: data?.totalOrderAmount ?? 0,
      format: formatVND,
      icon: Banknote,
    },
    {
      title: 'Đã thanh toán',
      value: data?.totalPaidAmount ?? 0,
      format: formatVND,
      icon: CreditCard,
    },
    {
      title: 'Công nợ',
      value: data?.totalDebt ?? 0,
      format: formatVND,
      icon: AlertTriangle,
    },
  ]

  if (isLoading) {
    return (
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className='flex h-[100px] items-center justify-center'>
              <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>{card.title}</CardTitle>
            <card.icon className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{card.format(card.value)}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// --- Main ---

export function SmartPurchasing({ purchasePeriodId }: { purchasePeriodId: string }) {
  return (
    <div className='space-y-4'>
      <InfoCards purchasePeriodId={purchasePeriodId} />
      <div className='grid gap-4 md:grid-cols-2'>
        <SupplierPieCard purchasePeriodId={purchasePeriodId} />
        <PurchaseSuggestionCard />
      </div>

      <QuickOrderCard />
    </div>
  )
}
