import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
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
import { getPurchasesStatisticsV2QueryOptions, getTopSuppliersQueryOptions, getLowStockInventoryQueryOptions, getSuggestQuickPurchaseOrdersQueryOptions } from '@/client/queries'
import type { TopSupplierType, QuickPurchaseOrderItem } from '@/services/supabase/database/repo/dashboardReportRepo'
import {
  DUMMY_PURCHASE_STATISTICS,
  DUMMY_TOP_SUPPLIERS,
  DUMMY_LOW_STOCK_PURCHASE,
  DUMMY_QUICK_ORDERS,
} from '../dummy/smart-purchasing'

const LOW_STOCK_DAYS = 30
const SUGGEST_STOCK_DAYS = 60

const supplierTabToType = {
  amount: 'by_order_amount',
  orders: 'by_orders',
  debt: 'by_debt',
} as const satisfies Record<string, TopSupplierType>

type SupplierTab = keyof typeof supplierTabToType

function groupBySupplier(items: QuickPurchaseOrderItem[]) {
  const map = new Map<string, { supplierId: string; supplierName: string; items: QuickPurchaseOrderItem[] }>()
  for (const item of items) {
    const key = item.supplierId || item.supplierName
    if (!map.has(key)) {
      map.set(key, { supplierId: item.supplierId, supplierName: item.supplierName, items: [] })
    }
    map.get(key)!.items.push(item)
  }
  return Array.from(map.values())
}

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
  if (daysLeft <= 7) return 'urgent'
  if (daysLeft <= 15) return 'medium'
  return 'low'
}

function PurchaseSuggestionCard({ isDummy }: { isDummy: boolean }) {
  const navigate = useNavigate()
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()

  const { data: lowStockItems = [], isLoading } = useQuery({
    ...getLowStockInventoryQueryOptions({
      locationId: selectedLocationId,
      days: LOW_STOCK_DAYS,
    }),
    enabled: !!user && !isDummy,
  })

  const resolvedItems = isDummy ? DUMMY_LOW_STOCK_PURCHASE : lowStockItems

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
        ) : resolvedItems.length === 0 ? (
          <div className='flex h-[160px] items-center justify-center text-xs text-muted-foreground'>
            Không có sản phẩm sắp hết hàng
          </div>
        ) : (
          <div className='space-y-2'>
            {resolvedItems.map((product) => {
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
                  <Button
                    size='sm'
                    variant='outline'
                    className='shrink-0'
                    onClick={() => navigate({
                      to: '/purchase-orders',
                      search: { productId: product.productId, suggestedQty: suggested },
                    })}
                  >
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

function SupplierPieCard({ purchasePeriodId, isDummy }: { purchasePeriodId: string; isDummy: boolean }) {
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()
  const [tab, setTab] = useState<SupplierTab>('amount')

  const { data: suppliers = [], isLoading } = useQuery({
    ...getTopSuppliersQueryOptions({
      locationId: selectedLocationId,
      type: supplierTabToType[tab],
      purchasePeriodId: purchasePeriodId ? Number(purchasePeriodId) : undefined,
    }),
    enabled: !!user && !isDummy,
  })

  const resolvedSuppliers = isDummy ? DUMMY_TOP_SUPPLIERS : suppliers

  const pieData: { name: string; value: number }[] = useMemo(() => {
    if (resolvedSuppliers.length <= 5) return resolvedSuppliers.map((s) => ({ name: s.name, value: s.statValue }))
    const top4 = resolvedSuppliers.slice(0, 4).map((s) => ({ name: s.name, value: s.statValue }))
    const othersValue = resolvedSuppliers.slice(4).reduce((s, i) => s + i.statValue, 0)
    return [...top4, { name: 'NCC khác', value: othersValue }]
  }, [resolvedSuppliers])

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

const QUICK_ORDER_STORAGE_KEY = 'quick-order-items'

export type QuickOrderStorageItem = {
  productId: string
  quantity: number
  unitId: string
  unitPrice: number
}

function QuickOrderCard({ isDummy }: { isDummy: boolean }) {
  const navigate = useNavigate()
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()

  const { data: rawItems = [], isLoading } = useQuery({
    ...getSuggestQuickPurchaseOrdersQueryOptions({
      locationId: selectedLocationId,
    }),
    enabled: !!user && !isDummy,
  })

  const resolvedItems = isDummy ? DUMMY_QUICK_ORDERS : rawItems

  const supplierGroups = useMemo(() => groupBySupplier(resolvedItems), [resolvedItems])

  const handleCreateOrder = (group: ReturnType<typeof groupBySupplier>[number]) => {
    const storageItems: QuickOrderStorageItem[] = group.items.map((i) => ({
      productId: i.productId,
      quantity: i.suggestedQuantity,
      unitId: i.lastOrderUnitId,
      unitPrice: i.lastCostPrice,
    }))
    sessionStorage.setItem(QUICK_ORDER_STORAGE_KEY, JSON.stringify(storageItems))
    navigate({
      to: '/purchase-orders',
      search: { quickOrderSupplierId: group.supplierId },
    })
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className='text-sm'>Tạo đơn nhanh</CardTitle>
          <CardDescription className='text-xs'>Đơn nhập hàng tự động điền sản phẩm & số lượng theo NCC</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className='flex h-[160px] items-center justify-center'>
            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
          </div>
        ) : supplierGroups.length === 0 ? (
          <div className='flex h-[160px] items-center justify-center text-xs text-muted-foreground'>
            Không có gợi ý đơn nhập hàng
          </div>
        ) : (
          <div className='space-y-3'>
            {supplierGroups.map((group) => {
              const totalCost = group.items.reduce((s, i) => s + i.estimatedCost, 0)
              return (
                <div
                  key={group.supplierId || group.supplierName}
                  className='flex items-center gap-3 rounded-lg border p-3'
                >
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium'>{group.supplierName}</span>
                      <Badge variant='secondary' className='text-[10px] px-1.5 py-0'>
                        {group.items.length} sản phẩm
                      </Badge>
                    </div>
                    <div className='mt-1 text-xs text-muted-foreground truncate'>
                      {group.items.map((i) => i.productName).join(', ')}
                    </div>
                    <div className='mt-1 text-xs font-medium'>
                      Tổng: <span className='text-primary'>{formatVND(totalCost)}</span>
                    </div>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    className='shrink-0 gap-1 text-xs'
                    onClick={() => handleCreateOrder(group)}
                  >
                    Tạo đơn
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

// --- InfoCards ---

function InfoCards({ purchasePeriodId, isDummy }: { purchasePeriodId: string; isDummy: boolean }) {
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()

  const { data, isLoading } = useQuery({
    ...getPurchasesStatisticsV2QueryOptions({
      locationId: selectedLocationId,
      purchasePeriodId: purchasePeriodId ? Number(purchasePeriodId) : undefined,
    }),
    enabled: !!user && !isDummy,
  })

  const resolved = isDummy ? DUMMY_PURCHASE_STATISTICS : data

  const cards = [
    {
      title: 'Tổng đơn nhập',
      value: resolved?.totalOrders ?? 0,
      format: (v: number) => v.toLocaleString('vi-VN'),
      icon: ShoppingCart,
    },
    {
      title: 'Tổng tiền nhập',
      value: resolved?.totalOrderAmount ?? 0,
      format: formatVND,
      icon: Banknote,
    },
    {
      title: 'Đã thanh toán',
      value: resolved?.totalPaidAmount ?? 0,
      format: formatVND,
      icon: CreditCard,
    },
    {
      title: 'Công nợ',
      value: resolved?.totalDebt ?? 0,
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

export function SmartPurchasing({ purchasePeriodId, isDummy }: { purchasePeriodId: string; isDummy: boolean }) {
  return (
    <div className='space-y-4'>
      <InfoCards purchasePeriodId={purchasePeriodId} isDummy={isDummy} />
      <div className='grid gap-4 md:grid-cols-2'>
        <SupplierPieCard purchasePeriodId={purchasePeriodId} isDummy={isDummy} />
        <PurchaseSuggestionCard isDummy={isDummy} />
      </div>

      <QuickOrderCard isDummy={isDummy} />
    </div>
  )
}
