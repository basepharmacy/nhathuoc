import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Route } from '@/routes/_authenticated/dashboard'
import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { DatePicker } from '@/components/date-picker'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { usePermissions } from '@/hooks/use-permissions'
import { useUser } from '@/client/provider'
import { getPurchasePeriodsQueryOptions } from '@/client/queries'
import { purchasePeriodsRepo } from '@/client'
import { ReportOverview } from './tabs/report-overview'
import { PurchaseReport } from './tabs/purchase-report'
import {
  ActivityHistoryTab,
  type ActivityTimePeriod,
  activityTimePeriodLabels,
} from './tabs/activity-history'
import { AdvancedReport } from './tabs/advanced-report'

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
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { tab: activeTab } = Route.useSearch()
  const navigate = useNavigate({ from: '/dashboard' })
  const { tenantType, role } = usePermissions()
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const queryClient = useQueryClient()

  const { data: periods = [] } = useQuery({
    ...getPurchasePeriodsQueryOptions(tenantId),
    enabled: !!tenantId,
  })

  const recentPeriods = [...periods.slice(0, 3)].reverse()

  useEffect(() => {
    if (periods.length > 0 && !selectedPeriodId) {
      setSelectedPeriodId(String(periods[0].id))
    }
  }, [periods, selectedPeriodId])

  const createPeriodMutation = useMutation({
    mutationFn: () =>
      purchasePeriodsRepo.createPurchasePeriod({
        tenantId,
        fromDate: new Date().toISOString().split('T')[0],
      }),
    onSuccess: (newPeriod) => {
      queryClient.invalidateQueries({ queryKey: ['purchase-periods', tenantId] })
      setSelectedPeriodId(String(newPeriod.id))
      toast.success('Đã tách sang kì mới thành công')
    },
    onError: () => {
      toast.error('Có lỗi khi tạo kì mới, vui lòng thử lại')
    },
  })

  const formatPeriodLabel = (period: { number: number; from_date: string; to_date: string; name: string | null }) => {
    const from = period.from_date
    const to = period.to_date === '9999-12-31' ? 'nay' : period.to_date
    return period.name ?? `Kì ${period.number} (${from} - ${to})`
  }

  function setActiveTab(tab: DashboardTab) {
    navigate({ search: { tab } })
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value as DashboardTab)}
    >
      <Header>
        <TabsList className='h-auto bg-transparent p-0 gap-2 overflow-x-auto'>
          <TabsTrigger value='report' className='border-0 bg-transparent shadow-none px-2 py-1 text-sm font-medium text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none'>Báo cáo</TabsTrigger>
          <TabsTrigger value='summary' className='border-0 bg-transparent shadow-none px-2 py-1 text-sm font-medium text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none'>Nhập hàng</TabsTrigger>
          <TabsTrigger value='activity-history' className='border-0 bg-transparent shadow-none px-2 py-1 text-sm font-medium text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none'>Lịch sử hoạt động</TabsTrigger>
          <TabsTrigger value='advanced' className='border-0 bg-transparent shadow-none px-2 py-1 text-sm font-medium text-muted-foreground data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none'>
            Báo cáo nâng cao
            {tenantType === '1_NORMAL' && (
              <span className='ms-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-400 px-1.5 py-0 text-[10px] font-semibold text-white'>
                PRO
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </Header>

      <Main>
        <div className='space-y-4'>
          <div className='flex items-center gap-2 overflow-x-auto'>
            {activeTab === 'summary' && (
              <div className='flex items-center gap-2'>
                <div className='inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground'>
                  {recentPeriods.map((period) => (
                    <button
                      key={period.id}
                      onClick={() => setSelectedPeriodId(String(period.id))}
                      className={cn(
                        'inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow]',
                        selectedPeriodId === String(period.id)
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {formatPeriodLabel(period)}
                    </button>
                  ))}
                </div>
                {role === 'OWNER' && (
                  <button
                    onClick={() => setConfirmOpen(true)}
                    className='inline-flex h-9 items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
                  >
                    <Plus className='size-4' />
                    Tách kì
                  </button>
                )}
              </div>
            )}
            {activeTab === 'report' && (
              <div className='inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground'>
                {Object.entries(timePeriodLabels).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => {
                      setTimePeriod(value as TimePeriod)
                      localStorage.setItem('dashboard-time-period', value)
                    }}
                    className={cn(
                      'inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow]',
                      timePeriod === value
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            {activeTab === 'activity-history' && (
              <div className='flex flex-1 items-center gap-2'>
                <div className='inline-flex h-9 w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground'>
                  {Object.entries(activityTimePeriodLabels).map(([value, label]) => (
                    <button
                      key={value}
                      onClick={() => {
                        setActivityTimePeriod(value as ActivityTimePeriod)
                        localStorage.setItem('dashboard-activity-time-period', value)
                        setActivityFromDate(undefined)
                        setActivityToDate(undefined)
                      }}
                      className={cn(
                        'inline-flex h-[calc(100%-1px)] items-center justify-center rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow]',
                        activityTimePeriod === value
                          ? 'bg-background text-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {activityTimePeriod === 'custom' && (
                  <div className='ml-auto flex items-center gap-2'>
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
                  </div>
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
            <AdvancedReport />
          </TabsContent>

          <TabsContent value='activity-history'>
            <ActivityHistoryTab
              timePeriod={activityTimePeriod}
              customFromDate={activityFromDate}
              customToDate={activityToDate}
            />
          </TabsContent>
        </div>
      </Main>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title='Xác nhận tách kì mới'
        desc='Bạn có chắc muốn tách sang kì nhập hàng mới? Kì mới sẽ bắt đầu từ ngày hôm nay.'
        confirmText='Đồng ý'
        cancelBtnText='Hủy'
        handleConfirm={() => {
          setConfirmOpen(false)
          createPeriodMutation.mutate()
        }}
        isLoading={createPeriodMutation.isPending}
      />
    </Tabs>
  )
}
