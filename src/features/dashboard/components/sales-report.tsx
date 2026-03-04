import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react'
import type { TimePeriod } from '..'
import { KpiGrid, type KpiItem } from './kpi-card'
import { MonthlyBarChart } from './monthly-bar-chart'

const periodCompareLabels: Record<TimePeriod, string> = {
  day: 'so với hôm qua',
  week: 'so với tuần trước',
  month: 'so với tháng trước',
  quarter: 'so với quý trước',
  year: 'so với năm trước',
}

const periodChartDescriptions: Record<TimePeriod, string> = {
  day: 'Doanh thu theo giờ hôm nay',
  week: 'Doanh thu theo ngày trong tuần',
  month: 'Doanh thu theo ngày trong tháng',
  quarter: 'Doanh thu theo tháng trong quý',
  year: 'Doanh thu theo tháng trong năm',
}

const periodTopProductDescriptions: Record<TimePeriod, string> = {
  day: '5 sản phẩm bán chạy nhất hôm nay',
  week: '5 sản phẩm bán chạy nhất tuần này',
  month: '5 sản phẩm bán chạy nhất tháng này',
  quarter: '5 sản phẩm bán chạy nhất quý này',
  year: '5 sản phẩm bán chạy nhất năm nay',
}

// TODO: replace with actual data fetching
function getSalesKpi(period: TimePeriod): KpiItem[] {
  const changeLabel = periodCompareLabels[period]
  const dataByPeriod: Record<TimePeriod, KpiItem[]> = {
    day: [
      { title: 'Doanh thu', value: formatCurrency(8_520_000, { style: 'currency' }), change: 5.2, icon: DollarSign, changeLabel },
      { title: 'Lợi nhuận', value: formatCurrency(2_130_000, { style: 'currency' }), change: 3.8, icon: TrendingUp, changeLabel },
      { title: 'Đơn bán', value: '12', change: -8.3, icon: ShoppingCart, changeLabel },
      { title: 'Khách hàng', value: '9', change: 12.5, icon: Users, changeLabel },
    ],
    week: [
      { title: 'Doanh thu', value: formatCurrency(42_350_000, { style: 'currency' }), change: 8.1, icon: DollarSign, changeLabel },
      { title: 'Lợi nhuận', value: formatCurrency(12_700_000, { style: 'currency' }), change: 10.2, icon: TrendingUp, changeLabel },
      { title: 'Đơn bán', value: '68', change: 5.4, icon: ShoppingCart, changeLabel },
      { title: 'Khách hàng', value: '32', change: 7.6, icon: Users, changeLabel },
    ],
    month: [
      { title: 'Doanh thu', value: formatCurrency(125_430_000, { style: 'currency' }), change: 12.5, icon: DollarSign, changeLabel },
      { title: 'Lợi nhuận', value: formatCurrency(38_200_000, { style: 'currency' }), change: 15.3, icon: TrendingUp, changeLabel },
      { title: 'Đơn bán', value: '234', change: 8.2, icon: ShoppingCart, changeLabel },
      { title: 'Khách hàng', value: '89', change: 5.1, icon: Users, changeLabel },
    ],
    quarter: [
      { title: 'Doanh thu', value: formatCurrency(382_900_000, { style: 'currency' }), change: 14.2, icon: DollarSign, changeLabel },
      { title: 'Lợi nhuận', value: formatCurrency(118_500_000, { style: 'currency' }), change: 16.4, icon: TrendingUp, changeLabel },
      { title: 'Đơn bán', value: '712', change: 9.7, icon: ShoppingCart, changeLabel },
      { title: 'Khách hàng', value: '248', change: 6.5, icon: Users, changeLabel },
    ],
    year: [
      { title: 'Doanh thu', value: formatCurrency(1_520_000_000, { style: 'currency' }), change: 18.3, icon: DollarSign, changeLabel },
      { title: 'Lợi nhuận', value: formatCurrency(456_000_000, { style: 'currency' }), change: 22.1, icon: TrendingUp, changeLabel },
      { title: 'Đơn bán', value: '2.845', change: 14.6, icon: ShoppingCart, changeLabel },
      { title: 'Khách hàng', value: '523', change: 11.8, icon: Users, changeLabel },
    ],
  }
  return dataByPeriod[period]
}

// TODO: replace with actual data fetching
function getChartData(period: TimePeriod) {
  const now = new Date()

  switch (period) {
    case 'day':
      return {
        data: [
          { name: '0:00', total: 0 },
          { name: '2:00', total: 250000 },
          { name: '4:00', total: 0 },
          { name: '6:00', total: 520000 },
          { name: '8:00', total: 1850000 },
          { name: '10:00', total: 2100000 },
          { name: '12:00', total: 980000 },
          { name: '14:00', total: 1650000 },
          { name: '16:00', total: 2350000 },
          { name: '18:00', total: 1920000 },
          { name: '20:00', total: 850000 },
          { name: '22:00', total: 320000 },
        ],
        tooltipLabelFormatter: (label: string) => label,
      }
    case 'week':
      return {
        data: [
          { name: 'T2', total: 5200000 },
          { name: 'T3', total: 6800000 },
          { name: 'T4', total: 5900000 },
          { name: 'T5', total: 7200000 },
          { name: 'T6', total: 8100000 },
          { name: 'T7', total: 9500000 },
          { name: 'CN', total: 4200000 },
        ],
        tooltipLabelFormatter: (label: string) => label,
      }
    case 'month': {
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
      const data = Array.from({ length: daysInMonth }, (_, i) => ({
        name: `${i + 1}`,
        total: Math.floor(Math.random() * 8000000) + 1000000,
      }))
      return {
        data,
        tooltipLabelFormatter: (label: string) => `Ngày ${label}`,
      }
    }
    case 'quarter':
      return {
        data: [
          { name: 'Th1', total: 124000000 },
          { name: 'Th2', total: 131000000 },
          { name: 'Th3', total: 127900000 },
        ],
        tooltipLabelFormatter: (label: string) => label,
      }
    case 'year':
      return {
        data: [
          { name: 'Th1', total: 28500000 },
          { name: 'Th2', total: 32100000 },
          { name: 'Th3', total: 45200000 },
          { name: 'Th4', total: 38700000 },
          { name: 'Th5', total: 41300000 },
          { name: 'Th6', total: 35800000 },
          { name: 'Th7', total: 52100000 },
          { name: 'Th8', total: 48600000 },
          { name: 'Th9', total: 39400000 },
          { name: 'Th10', total: 44800000 },
          { name: 'Th11', total: 51200000 },
          { name: 'Th12', total: 47300000 },
        ],
        tooltipLabelFormatter: (label: string) => label,
      }
  }
}

// TODO: replace with actual data fetching
function getTopProducts(period: TimePeriod) {
  const dataByPeriod: Record<TimePeriod, typeof topProductsMonth> = {
    day: [
      { name: 'Paracetamol 500mg', quantity: 25, unitName: 'viên', revenue: 1_250_000 },
      { name: 'Vitamin C 1000mg', quantity: 18, unitName: 'viên', revenue: 900_000 },
      { name: 'Amoxicillin 500mg', quantity: 12, unitName: 'vỉ', revenue: 960_000 },
      { name: 'Cetirizin 10mg', quantity: 10, unitName: 'tuýp', revenue: 400_000 },
      { name: 'Omeprazol 20mg', quantity: 8, unitName: 'viên', revenue: 480_000 },
    ],
    week: [
      { name: 'Paracetamol 500mg', quantity: 95, unitName: 'viên', revenue: 4_750_000 },
      { name: 'Vitamin C 1000mg', quantity: 72, unitName: 'viên', revenue: 3_600_000 },
      { name: 'Amoxicillin 500mg', quantity: 55, unitName: 'vỉ', revenue: 4_400_000 },
      { name: 'Omeprazol 20mg', quantity: 42, unitName: 'viên', revenue: 2_520_000 },
      { name: 'Cetirizin 10mg', quantity: 38, unitName: 'tuýp', revenue: 1_520_000 },
    ],
    month: topProductsMonth,
    quarter: [
      { name: 'Paracetamol 500mg', quantity: 1120, unitName: 'viên', revenue: 56_000_000 },
      { name: 'Vitamin C 1000mg', quantity: 860, unitName: 'viên', revenue: 43_000_000 },
      { name: 'Amoxicillin 500mg', quantity: 640, unitName: 'vỉ', revenue: 51_200_000 },
      { name: 'Omeprazol 20mg', quantity: 510, unitName: 'viên', revenue: 30_600_000 },
      { name: 'Cetirizin 10mg', quantity: 430, unitName: 'tuýp', revenue: 17_200_000 },
    ],
    year: [
      { name: 'Paracetamol 500mg', quantity: 3_840, unitName: 'viên', revenue: 192_000_000 },
      { name: 'Vitamin C 1000mg', quantity: 3_300, unitName: 'viên', revenue: 165_000_000 },
      { name: 'Amoxicillin 500mg', quantity: 2_376, unitName: 'vỉ', revenue: 190_080_000 },
      { name: 'Omeprazol 20mg', quantity: 1_980, unitName: 'viên', revenue: 118_800_000 },
      { name: 'Cetirizin 10mg', quantity: 1_704, unitName: 'tuýp', revenue: 68_160_000 },
    ],
  }
  return dataByPeriod[period]
}

const topProductsMonth = [
  { name: 'Paracetamol 500mg', quantity: 320, unitName: 'viên', revenue: 16_000_000 },
  { name: 'Vitamin C 1000mg', quantity: 275, unitName: 'viên', revenue: 13_750_000 },
  { name: 'Amoxicillin 500mg', quantity: 198, unitName: 'vỉ', revenue: 15_840_000 },
  { name: 'Omeprazol 20mg', quantity: 165, unitName: 'viên', revenue: 9_900_000 },
  { name: 'Cetirizin 10mg', quantity: 142, unitName: 'tuýp', revenue: 5_680_000 },
]

type SalesReportProps = {
  timePeriod: TimePeriod
}

export function SalesReport({ timePeriod }: SalesReportProps) {
  const salesKpi = getSalesKpi(timePeriod)
  const { data: chartData, tooltipLabelFormatter } = getChartData(timePeriod)
  const topProducts = getTopProducts(timePeriod)

  return (
    <div className='space-y-4'>
      <KpiGrid items={salesKpi} />
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <Card className='col-span-1 lg:col-span-4'>
          <CardHeader>
            <CardTitle>Tổng quan doanh thu</CardTitle>
            <CardDescription>{periodChartDescriptions[timePeriod]}</CardDescription>
          </CardHeader>
          <CardContent className='ps-2'>
            <MonthlyBarChart
              data={chartData}
              tooltipLabel='Doanh thu'
              tooltipLabelFormatter={tooltipLabelFormatter}
            />
          </CardContent>
        </Card>
        <Card className='col-span-1 flex flex-col lg:col-span-3'>
          <Tabs defaultValue='quantity' className='flex flex-1 flex-col'>
            <CardHeader className='flex-row items-start justify-between space-y-0'>
              <div className='space-y-1.5'>
                <CardTitle>Top sản phẩm bán chạy</CardTitle>
                <CardDescription>{periodTopProductDescriptions[timePeriod]}</CardDescription>
              </div>
              <TabsList className='shrink-0'>
                <TabsTrigger value='quantity'>Số lượng</TabsTrigger>
                <TabsTrigger value='revenue'>Doanh thu</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className='flex flex-1 flex-col'>
              <TabsContent value='quantity' className='mt-0 flex flex-1 flex-col'>
                <div className='flex flex-1 flex-col justify-between divide-y'>
                  {topProducts.map((product, index) => (
                    <div key={product.name} className='flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0'>
                      <div className='flex items-center gap-3'>
                        <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium'>
                          {index + 1}
                        </span>
                        <p className='text-sm leading-none font-medium'>{product.name}</p>
                      </div>
                      <div className='text-sm font-medium tabular-nums'>
                        {product.quantity.toLocaleString('vi-VN')} {product.unitName}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value='revenue' className='mt-0 flex flex-1 flex-col'>
                <div className='flex flex-1 flex-col justify-between divide-y'>
                  {[...topProducts]
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((product, index) => (
                      <div key={product.name} className='flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0'>
                        <div className='flex items-center gap-3'>
                          <span className='flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium'>
                            {index + 1}
                          </span>
                          <p className='text-sm leading-none font-medium'>{product.name}</p>
                        </div>
                        <div className='text-sm font-medium tabular-nums'>
                          {formatCurrency(product.revenue, { style: 'currency' })}
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
