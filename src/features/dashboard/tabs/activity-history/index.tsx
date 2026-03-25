import { useCallback, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, startOfDay, startOfWeek, startOfMonth, startOfQuarter, startOfYear } from 'date-fns'
import { vi } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUser } from '@/client/provider'
import { useLocationContext } from '@/context/location-provider'
import { getActivityHistoryQueryOptions } from '@/client/queries'
import type { ActivityHistoryWithRelations } from '@/services/supabase/database/repo/activityHistoryRepo'
import { ActivityItem } from './components/activity-item'

export type ActivityTimePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year' | 'custom'

export const activityTimePeriodLabels: Record<ActivityTimePeriod, string> = {
  day: 'Ngày',
  week: 'Tuần',
  month: 'Tháng',
  quarter: 'Quý',
  year: 'Năm',
  custom: 'Tuỳ chỉnh',
}

const PAGE_SIZE = 20

function getDateRange(period: ActivityTimePeriod): { fromDate: string; toDate: string } {
  const now = new Date()
  const toDate = format(now, 'yyyy-MM-dd')
  let from: Date

  switch (period) {
    case 'day':
      from = startOfDay(now)
      break
    case 'week':
      from = startOfWeek(now, { locale: vi, weekStartsOn: 1 })
      break
    case 'month':
      from = startOfMonth(now)
      break
    case 'quarter':
      from = startOfQuarter(now)
      break
    case 'year':
      from = startOfYear(now)
      break
    default:
      from = startOfMonth(now)
  }

  return { fromDate: format(from, 'yyyy-MM-dd'), toDate }
}

export function ActivityHistoryTab({
  timePeriod,
  customFromDate,
  customToDate,
}: {
  timePeriod: ActivityTimePeriod
  customFromDate?: Date
  customToDate?: Date
}) {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const { selectedLocationId } = useLocationContext()
  const [locationFilter, setLocationFilter] = useState<string>(selectedLocationId ?? 'all')
  const [allData, setAllData] = useState<ActivityHistoryWithRelations[]>([])
  const [pageIndex, setPageIndex] = useState(0)

  const { fromDate, toDate } = useMemo(() => {
    if (timePeriod === 'custom') {
      return {
        fromDate: customFromDate ? format(customFromDate, 'yyyy-MM-dd') : null,
        toDate: customToDate ? format(customToDate, 'yyyy-MM-dd') : null,
      }
    }
    return getDateRange(timePeriod)
  }, [timePeriod, customFromDate, customToDate])

  const effectiveLocationId = locationFilter === 'all' ? null : locationFilter

  const { data: result, isLoading, isFetching } = useQuery({
    ...getActivityHistoryQueryOptions({
      tenantId,
      locationId: effectiveLocationId,
      pageIndex,
      pageSize: PAGE_SIZE,
      fromDate,
      toDate,
    }),
    enabled: !!tenantId,
  })

  // Reset accumulated data when filters change
  useEffect(() => {
    setPageIndex(0)
    setAllData([])
  }, [timePeriod, customFromDate, customToDate, locationFilter])

  // Accumulate data as pages load
  useEffect(() => {
    if (result?.data) {
      setAllData((prev) => {
        if (pageIndex === 0) return result.data
        return [...prev, ...result.data]
      })
    }
  }, [result, pageIndex])

  // Sync location filter with global location context
  useEffect(() => {
    setLocationFilter(selectedLocationId ?? 'all')
  }, [selectedLocationId])

  const total = result?.total ?? 0
  const hasMore = allData.length < total

  const handleLoadMore = useCallback(() => {
    setPageIndex((prev) => prev + 1)
  }, [])

  return (
    <div className='space-y-4'>
      <div className='rounded-lg border bg-card'>
        {isLoading && pageIndex === 0 ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
          </div>
        ) : allData.length === 0 ? (
          <div className='flex items-center justify-center py-12'>
            <p className='text-sm text-muted-foreground'>Không có hoạt động nào.</p>
          </div>
        ) : (
          <div className='divide-y px-4'>
            {allData.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>
        )}

        {hasMore && (
          <div className='flex justify-center py-3 border-t'>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleLoadMore}
              disabled={isFetching}
              className='text-sm text-muted-foreground'
            >
              {isFetching ? (
                <>
                  <Loader2 className='h-4 w-4 animate-spin mr-1.5' />
                  Đang tải...
                </>
              ) : (
                `Xem thêm (${allData.length}/${total})`
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
