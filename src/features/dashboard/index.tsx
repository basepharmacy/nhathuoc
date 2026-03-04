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
import { ReportOverview } from './components/report-overview'

export type TimePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year'
type DashboardTab = 'report' | 'summary' | 'advanced'

const timePeriodLabels: Record<TimePeriod, string> = {
  day: 'Ngày',
  week: 'Tuần',
  month: 'Tháng',
  quarter: 'Quý',
  year: 'Năm',
}

export function Dashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month')
  const [activeTab, setActiveTab] = useState<DashboardTab>('report')

  return (
    <>
      <Header>
        <div className='flex items-center gap-2'>
          <h1 className='text-xl font-bold'>Tổng hợp - Báo cáo</h1>
        </div>
      </Header>

      <Main>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as DashboardTab)}
          className='space-y-4'
        >
          <div className='flex items-center justify-between gap-3'>
            <div className='overflow-x-auto pb-2'>
              <TabsList>
                <TabsTrigger value='report'>Báo cáo</TabsTrigger>
                <TabsTrigger value='summary'>Tổng hợp</TabsTrigger>
                <TabsTrigger value='advanced'>Báo cáo nâng cao</TabsTrigger>
              </TabsList>
            </div>
            {activeTab === 'report' && (
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
            )}
          </div>

          <TabsContent value='report'>
            <ReportOverview timePeriod={timePeriod} />
          </TabsContent>

          <TabsContent value='summary'>
            <div className='flex min-h-[320px] items-center justify-center rounded-lg border border-dashed bg-muted/20'>
              <p className='text-sm text-muted-foreground'>Ra mắt sớm</p>
            </div>
          </TabsContent>

          <TabsContent value='advanced'>
            <div className='flex min-h-[320px] items-center justify-center rounded-lg border border-dashed bg-muted/20'>
              <p className='text-sm text-muted-foreground'>Ra mắt sớm</p>
            </div>
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
