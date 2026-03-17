import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  getPurchasesStatisticsV2QueryOptions,
  getTopSuppliersQueryOptions,
  getTopPurchasedProductsQueryOptions,
} from '@/client/queries'
import { useUser } from '@/client/provider'
import { useLocationContext } from '@/context/location-provider'
import { formatCurrency } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { ClipboardList, DollarSign, TrendingDown, Truck } from 'lucide-react'
import { useState } from 'react'
import { KpiGrid, type KpiItem } from './kpi-card'
import { MonthlyBarChart } from './monthly-bar-chart'
import type { TopSupplierType, TopPurchasedProductType } from '@/services/supabase/database/repo/dashboardReportRepo'

const productTabToType = {
  orders: 'by_orders',
  amount: 'by_order_amount',
} as const satisfies Record<string, TopPurchasedProductType>

type ProductTab = keyof typeof productTabToType

const supplierTabToType = {
  orders: 'by_orders',
  amount: 'by_order_amount',
  debt: 'by_debt',
} as const satisfies Record<string, TopSupplierType>

type SupplierTab = keyof typeof supplierTabToType

export function PurchaseReport() {
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()
  const locationId = selectedLocationId ?? user?.location?.id ?? undefined
  const [supplierTab, setSupplierTab] = useState<SupplierTab>('orders')
  const [productTab, setProductTab] = useState<ProductTab>('amount')

  const { data: stats } = useQuery({
    ...getPurchasesStatisticsV2QueryOptions({ locationId }),
    enabled: !!user,
  })

  const { data: topSuppliers = [] } = useQuery({
    ...getTopSuppliersQueryOptions({ locationId, type: supplierTabToType[supplierTab] }),
    enabled: !!user,
  })

  const { data: topProductsByAmount = [] } = useQuery({
    ...getTopPurchasedProductsQueryOptions({ locationId, type: productTabToType[productTab] }),
    enabled: !!user,
  })

  const purchaseKpi: KpiItem[] = [
    {
      title: 'Giá trị nhập',
      value: formatCurrency(stats?.totalOrderAmount ?? 0, { style: 'currency' }),
      icon: DollarSign,
    },
    {
      title: 'Đơn nhập hàng',
      value: String(stats?.totalOrders ?? 0),
      icon: ClipboardList,
    },
    {
      title: 'Đã thanh toán',
      value: formatCurrency(stats?.totalPaidAmount ?? 0, { style: 'currency' }),
      icon: Truck,
    },
    {
      title: 'Công nợ',
      value: formatCurrency(stats?.totalDebt ?? 0, { style: 'currency' }),
      icon: TrendingDown,
    },
  ]

  const chartData = topProductsByAmount.map((p) => ({
    name: p.name,
    total: p.statValue,
  }))

  return (
    <div className='space-y-4'>
      <KpiGrid items={purchaseKpi} />
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <Card className='col-span-1 lg:col-span-4'>
          <Tabs value={productTab} onValueChange={(v) => setProductTab(v as ProductTab)}>
            <CardHeader className='space-y-2'>
              <div className='flex items-center gap-4'>
                <CardTitle>Top sản phẩm</CardTitle>
                <TabsList className='ml-auto shrink-0'>
                  <TabsTrigger value='amount'>Giá trị</TabsTrigger>
                  <TabsTrigger value='orders'>Đơn hàng</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>5 sản phẩm có {productTab === 'amount' ? 'giá trị nhập cao nhất' : 'số đơn nhập nhiều nhất'}</CardDescription>
            </CardHeader>
            <CardContent className='ps-2'>
              <MonthlyBarChart data={chartData} tooltipLabel={productTab === 'amount' ? 'Giá trị nhập' : 'Số đơn'} />
            </CardContent>
          </Tabs>
        </Card>
        <Card className='col-span-1 flex flex-col lg:col-span-3'>
          <Tabs value={supplierTab} onValueChange={(v) => setSupplierTab(v as SupplierTab)} className='flex flex-1 flex-col'>
            <CardHeader className='space-y-2'>
              <div className='flex items-center gap-4'>
                <CardTitle>Top nhà cung cấp</CardTitle>
                <TabsList className='ml-auto shrink-0'>
                  <TabsTrigger value='amount'>Giá trị</TabsTrigger>
                  <TabsTrigger value='debt'>Công nợ</TabsTrigger>
                  <TabsTrigger value='orders'>Đơn hàng</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>5 nhà cung cấp hàng đầu</CardDescription>
            </CardHeader>
            <CardContent className='flex flex-1 flex-col'>
              <div className='flex flex-1 flex-col justify-between divide-y'>
                {topSuppliers.map((supplier, index) => (
                  <div key={supplier.id ?? supplier.name} className='flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0'>
                    <div className='flex items-center gap-3'>
                      <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium'>
                        {index + 1}
                      </span>
                      <p className='text-sm leading-none font-medium'>{supplier.name}</p>
                    </div>
                    <div className='text-sm font-medium tabular-nums'>
                      {supplierTab === 'orders'
                        ? `${supplier.statValue} đơn`
                        : formatCurrency(supplier.statValue, { style: 'currency' })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div >
  )
}
