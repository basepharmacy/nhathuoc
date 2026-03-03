import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'
import { AlertTriangle, Package, Timer, Warehouse } from 'lucide-react'
import { KpiGrid, type KpiItem } from './kpi-card'
import { MonthlyBarChart } from './monthly-bar-chart'

// TODO: replace with actual data fetching
const inventoryKpi: KpiItem[] = [
  { title: 'Giá trị tồn kho', value: formatCurrency(1_250_000_000, { style: 'currency' }), icon: Warehouse },
  { title: 'Tổng sản phẩm', value: '1.250', icon: Package },
  { title: 'Sắp hết hàng', value: '18', icon: AlertTriangle },
  { title: 'Sắp hết hạn', value: '7', icon: Timer },
]

const inventoryChartData = [
  { name: 'Paracetamol', total: 18500000 },
  { name: 'Amoxicillin', total: 15200000 },
  { name: 'Omeprazol', total: 12800000 },
  { name: 'Vitamin C', total: 11400000 },
  { name: 'Cetirizine', total: 9600000 },
  { name: 'Metformin', total: 8900000 },
  { name: 'Losartan', total: 7500000 },
  { name: 'Atorvastatin', total: 6800000 },
  { name: 'Azithromycin', total: 5200000 },
  { name: 'Ibuprofen', total: 4100000 },
]

const alerts = [
  { productName: 'Amoxicillin 500mg', type: 'low_stock' as const, detail: 'Còn 12 / Tối thiểu 50' },
  { productName: 'Omeprazol 20mg', type: 'expiring' as const, detail: 'Lô B240315 - HSD: 15/05/2026' },
  { productName: 'Cetirizine 10mg', type: 'low_stock' as const, detail: 'Còn 8 / Tối thiểu 30' },
  { productName: 'Vitamin B Complex', type: 'expiring' as const, detail: 'Lô B240201 - HSD: 20/04/2026' },
  { productName: 'Metformin 850mg', type: 'low_stock' as const, detail: 'Còn 5 / Tối thiểu 40' },
]

export function InventoryReport() {
  // TODO: fetch data here based on location filter

  return (
    <div className='space-y-4'>
      <KpiGrid items={inventoryKpi} />
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-7'>
        <Card className='col-span-1 lg:col-span-4'>
          <CardHeader>
            <CardTitle>Top sản phẩm theo giá trị tồn</CardTitle>
            <CardDescription>10 sản phẩm có giá trị tồn kho cao nhất</CardDescription>
          </CardHeader>
          <CardContent className='ps-2'>
            <MonthlyBarChart data={inventoryChartData} tooltipLabel='Giá trị tồn' />
          </CardContent>
        </Card>
        <Card className='col-span-1 lg:col-span-3'>
          <CardHeader>
            <CardTitle>Cần chú ý</CardTitle>
            <CardDescription>Sản phẩm sắp hết hàng & sắp hết hạn</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-6'>
              {alerts.map((alert, index) => (
                <div key={index} className='flex items-center justify-between gap-4'>
                  <div className='min-w-0 space-y-1'>
                    <p className='truncate text-sm leading-none font-medium'>
                      {alert.productName}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {alert.detail}
                    </p>
                  </div>
                  <Badge variant={alert.type === 'low_stock' ? 'destructive' : 'outline'} className='shrink-0'>
                    {alert.type === 'low_stock' ? 'Sắp hết' : 'Sắp hạn'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
