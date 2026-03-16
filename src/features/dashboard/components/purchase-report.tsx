import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getPurchasesStatisticsQueryOptions } from '@/client/queries'
import { useUser } from '@/client/provider'
import { useLocationContext } from '@/context/location-provider'
import { formatCurrency } from '@/lib/utils'
import { useQuery } from '@tanstack/react-query'
import { ClipboardList, DollarSign, TrendingDown, Truck } from 'lucide-react'
import { KpiGrid, type KpiItem } from './kpi-card'
import { MonthlyBarChart } from './monthly-bar-chart'

export function PurchaseReport() {
  const { user } = useUser()
  const { selectedLocationId } = useLocationContext()
  const locationId = selectedLocationId ?? user?.location?.id ?? undefined

  const { data: stats } = useQuery({
    ...getPurchasesStatisticsQueryOptions({ locationId }),
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

  const chartData = (stats?.topSuppliersByOrderAmount ?? []).map((s) => ({
    name: s.name,
    total: s.orderAmount,
  }))

  const topByOrders = stats?.topSuppliersByOrders ?? []
  const topByAmount = stats?.topSuppliersByOrderAmount ?? []
  const topByDebt = stats?.topSuppliersByDebt ?? []

  return (
    <div className='space-y-4'>
      <KpiGrid items={purchaseKpi} />
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <Card className='col-span-1 lg:col-span-4'>
          <CardHeader>
            <CardTitle>Top nhà cung cấp theo giá trị nhập</CardTitle>
            <CardDescription>5 nhà cung cấp có giá trị nhập cao nhất</CardDescription>
          </CardHeader>
          <CardContent className='ps-2'>
            <MonthlyBarChart data={chartData} tooltipLabel='Giá trị nhập' />
          </CardContent>
        </Card>
        <Card className='col-span-1 flex flex-col lg:col-span-3'>
          <Tabs defaultValue='orders' className='flex flex-1 flex-col'>
            <CardHeader className='flex-row items-start justify-between space-y-0'>
              <div className='space-y-1.5'>
                <CardTitle>Top nhà cung cấp</CardTitle>
                <CardDescription>5 nhà cung cấp hàng đầu</CardDescription>
              </div>
              <TabsList className='shrink-0'>
                <TabsTrigger value='orders'>Đơn hàng</TabsTrigger>
                <TabsTrigger value='amount'>Giá trị</TabsTrigger>
                <TabsTrigger value='debt'>Công nợ</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className='flex flex-1 flex-col'>
              <TabsContent value='orders' className='mt-0 flex flex-1 flex-col'>
                <div className='flex flex-1 flex-col justify-between divide-y'>
                  {topByOrders.map((supplier, index) => (
                    <div key={supplier.id ?? supplier.name} className='flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0'>
                      <div className='flex items-center gap-3'>
                        <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium'>
                          {index + 1}
                        </span>
                        <p className='text-sm leading-none font-medium'>{supplier.name}</p>
                      </div>
                      <div className='text-sm font-medium tabular-nums'>
                        {supplier.orders.toLocaleString('vi-VN')} đơn
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value='amount' className='mt-0 flex flex-1 flex-col'>
                <div className='flex flex-1 flex-col justify-between divide-y'>
                  {topByAmount.map((supplier, index) => (
                    <div key={supplier.id ?? supplier.name} className='flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0'>
                      <div className='flex items-center gap-3'>
                        <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium'>
                          {index + 1}
                        </span>
                        <p className='text-sm leading-none font-medium'>{supplier.name}</p>
                      </div>
                      <div className='text-sm font-medium tabular-nums'>
                        {formatCurrency(supplier.orderAmount, { style: 'currency' })}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value='debt' className='mt-0 flex flex-1 flex-col'>
                <div className='flex flex-1 flex-col justify-between divide-y'>
                  {topByDebt.map((supplier, index) => (
                    <div key={supplier.id ?? supplier.name} className='flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0'>
                      <div className='flex items-center gap-3'>
                        <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium'>
                          {index + 1}
                        </span>
                        <p className='text-sm leading-none font-medium'>{supplier.name}</p>
                      </div>
                      <div className='text-sm font-medium tabular-nums'>
                        {formatCurrency(supplier.debt, { style: 'currency' })}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
