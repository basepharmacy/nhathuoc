import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { SalesReport } from './components/sales-report'
import { PurchaseReport } from './components/purchase-report'
import { InventoryReport } from './components/inventory-report'

export type TimePeriod = 'day' | 'week' | 'month' | 'year'

const timePeriodLabels: Record<TimePeriod, string> = {
  day: 'Ngày',
  week: 'Tuần',
  month: 'Tháng',
  year: 'Năm',
}

export function Dashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month')

  return (
    <>
      <Header>
        <div className='flex items-center gap-2'>
          <h1 className='text-xl font-bold'>Tổng hợp - Báo cáo</h1>
        </div>
      </Header>

      <Main>
        <Tabs defaultValue='sales' className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='w-full overflow-x-auto pb-2'>
              <TabsList>
                <TabsTrigger value='sales'>Báo cáo bán hàng</TabsTrigger>
                <TabsTrigger value='purchases'>Báo cáo nhập hàng</TabsTrigger>
                <TabsTrigger value='inventory'>Báo cáo tồn kho</TabsTrigger>
              </TabsList>
            </div>
            <Select
              value={timePeriod}
              onValueChange={(value) => setTimePeriod(value as TimePeriod)}
            >
              <SelectTrigger className='w-[160px] shrink-0'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(timePeriodLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TabsContent value='sales'>
            <SalesReport timePeriod={timePeriod} />
          </TabsContent>

          <TabsContent value='purchases'>
            <PurchaseReport />
          </TabsContent>

          <TabsContent value='inventory'>
            <InventoryReport />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
