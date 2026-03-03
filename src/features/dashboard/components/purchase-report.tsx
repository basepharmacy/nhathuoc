import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { ClipboardList, DollarSign, Package, Truck } from 'lucide-react'
import { KpiGrid, type KpiItem } from './kpi-card'
import { MonthlyBarChart } from './monthly-bar-chart'

// TODO: replace with actual data fetching
const purchaseKpi: KpiItem[] = [
  { title: 'Tổng giá trị nhập', value: formatCurrency(98_750_000, { style: 'currency' }), change: 6.8, icon: DollarSign },
  { title: 'Đơn nhập hàng', value: '47', change: -3.2, icon: ClipboardList },
  { title: 'Nhà cung cấp', value: '12', change: 9.1, icon: Truck },
  { title: 'Sản phẩm nhập', value: '385', change: 4.7, icon: Package },
]

const purchaseChartData = [
  { name: 'Th1', total: 22000000 },
  { name: 'Th2', total: 27500000 },
  { name: 'Th3', total: 35800000 },
  { name: 'Th4', total: 31200000 },
  { name: 'Th5', total: 33600000 },
  { name: 'Th6', total: 28900000 },
  { name: 'Th7', total: 42500000 },
  { name: 'Th8', total: 39100000 },
  { name: 'Th9', total: 30800000 },
  { name: 'Th10', total: 36200000 },
  { name: 'Th11', total: 41500000 },
  { name: 'Th12', total: 38000000 },
]

const recentPurchases = [
  { code: 'PN000158', supplierName: 'Công ty Dược phẩm Hậu Giang', amount: 12500000, time: '15:10' },
  { code: 'PN000157', supplierName: 'Công ty TNHH Medipharco', amount: 8700000, time: '11:30' },
  { code: 'PN000156', supplierName: 'Công ty Dược Sài Gòn', amount: 5200000, time: '09:45' },
  { code: 'PN000155', supplierName: 'Công ty CP Pymepharco', amount: 15800000, time: '08:20' },
  { code: 'PN000154', supplierName: 'Công ty Dược phẩm OPC', amount: 3400000, time: 'Hôm qua' },
]

export function PurchaseReport() {
  // TODO: fetch data here based on location filter

  return (
    <div className='space-y-4'>
      <KpiGrid items={purchaseKpi} />
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <Card className='col-span-1 lg:col-span-4'>
          <CardHeader>
            <CardTitle>Tổng quan giá trị nhập hàng</CardTitle>
            <CardDescription>Giá trị nhập theo tháng năm 2026</CardDescription>
          </CardHeader>
          <CardContent className='ps-2'>
            <MonthlyBarChart data={purchaseChartData} tooltipLabel='Giá trị nhập' />
          </CardContent>
        </Card>
        <Card className='col-span-1 lg:col-span-3'>
          <CardHeader>
            <CardTitle>Đơn nhập gần đây</CardTitle>
            <CardDescription>5 đơn nhập mới nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {recentPurchases.map((purchase) => (
                <div key={purchase.code} className='flex items-center justify-between gap-4'>
                  <div className='min-w-0 space-y-1'>
                    <p className='truncate text-sm leading-none font-medium'>
                      {purchase.supplierName}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {purchase.code} · {purchase.time}
                    </p>
                  </div>
                  <div className='shrink-0 text-sm font-medium'>
                    {formatCurrency(purchase.amount, { style: 'currency' })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
