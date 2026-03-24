import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Route } from '@/routes/_authenticated/dashboard'
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
import { DatePicker } from '@/components/date-picker'
import { usePermissions } from '@/hooks/use-permissions'
import { PurchasePeriodSelector } from '@/components/purchase-period-selector'
import { ReportOverview } from './components/report-overview'
import { PurchaseReport } from './components/purchase-report'
import {
  ActivityHistoryTab,
  type ActivityTimePeriod,
  activityTimePeriodLabels,
} from './components/activity-history-tab'

export type TimePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year'
export type DashboardTab = 'report' | 'summary' | 'advanced' | 'activity-history'

const timePeriodLabels: Record<TimePeriod, string> = {
  day: 'Ngày',
  week: 'Tuần',
  month: 'Tháng',
  quarter: 'Quý',
  year: 'Năm',
}

export function Dashboard() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(
    () => (localStorage.getItem('dashboard-time-period') as TimePeriod) || 'month'
  )
  const [activityTimePeriod, setActivityTimePeriod] = useState<ActivityTimePeriod>(
    () => (localStorage.getItem('dashboard-activity-time-period') as ActivityTimePeriod) || 'month'
  )
  const [selectedPeriodId, setSelectedPeriodId] = useState('')
  const [activityFromDate, setActivityFromDate] = useState<Date | undefined>()
  const [activityToDate, setActivityToDate] = useState<Date | undefined>()
  const { tab: activeTab } = Route.useSearch()
  const navigate = useNavigate({ from: '/dashboard' })
  const { tenantType } = usePermissions()

  function setActiveTab(tab: DashboardTab) {
    navigate({ search: { tab } })
  }

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
                <TabsTrigger value='summary'>Nhập hàng</TabsTrigger>
                <TabsTrigger value='activity-history'>Lịch sử hoạt động</TabsTrigger>
                <TabsTrigger value='advanced'>
                  Báo cáo nâng cao
                  {tenantType === '1_NORMAL' && (
                    <span className='ms-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-400 px-1.5 py-0 text-[10px] font-semibold text-white'>
                      PRO
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            {activeTab === 'summary' && (
              <PurchasePeriodSelector
                periodId={selectedPeriodId}
                onPeriodChange={setSelectedPeriodId}
              />
            )}
            {activeTab === 'report' && (
              <Select
                value={timePeriod}
                onValueChange={(value) => {
                  setTimePeriod(value as TimePeriod)
                  localStorage.setItem('dashboard-time-period', value)
                }}
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
            {activeTab === 'activity-history' && (
              <div className='flex items-center gap-2 shrink-0'>
                <Select
                  value={activityTimePeriod}
                  onValueChange={(value) => {
                    setActivityTimePeriod(value as ActivityTimePeriod)
                    localStorage.setItem('dashboard-activity-time-period', value)
                    setActivityFromDate(undefined)
                    setActivityToDate(undefined)
                  }}
                >
                  <SelectTrigger className='w-[160px]'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(activityTimePeriodLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {activityTimePeriod === 'custom' && (
                  <>
                    <DatePicker
                      selected={activityFromDate}
                      onSelect={setActivityFromDate}
                      placeholder='Từ ngày'
                      disablePastDates={false}
                      className='w-36 h-9 text-sm justify-start text-start font-normal data-[empty=true]:text-muted-foreground'
                    />
                    <DatePicker
                      selected={activityToDate}
                      onSelect={setActivityToDate}
                      placeholder='Đến ngày'
                      disablePastDates={false}
                      className='w-36 h-9 text-sm justify-start text-start font-normal data-[empty=true]:text-muted-foreground'
                    />
                  </>
                )}
              </div>
            )}
          </div>

          <TabsContent value='report'>
            <ReportOverview timePeriod={timePeriod} />
          </TabsContent>

          <TabsContent value='summary'>
            <PurchaseReport purchasePeriodId={selectedPeriodId ? Number(selectedPeriodId) : undefined} />
          </TabsContent>

          <TabsContent value='advanced'>
            <div className='flex min-h-[320px] items-center justify-center rounded-lg border border-dashed bg-muted/20'>
              <p className='text-sm text-muted-foreground'>Ra mắt sớm</p>
            </div>
          </TabsContent>

          <TabsContent value='activity-history'>
            <ActivityHistoryTab
              timePeriod={activityTimePeriod}
              customFromDate={activityFromDate}
              customToDate={activityToDate}
            />
          </TabsContent>
        </Tabs>
      </Main>
    </>
  )
}
