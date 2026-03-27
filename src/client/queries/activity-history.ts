import { queryOptions } from "@tanstack/react-query"
import { activityHistoryRepo } from '..'
import type { ActivityHistoryQueryInput } from '@/services/supabase/database/model'

export const getActivityHistoryQueryOptions = (
  params: ActivityHistoryQueryInput
) =>
  queryOptions({
    queryKey: [
      'activity-history',
      params.tenantId,
      params.userId ?? 'all',
      {
        locationId: params.locationId ?? 'all',
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        fromDate: params.fromDate ?? null,
        toDate: params.toDate ?? null,
      },
    ],
    queryFn: async () => {
      if (!params.tenantId) {
        return { data: [], total: 0 }
      }
      return activityHistoryRepo.getActivityHistory(params)
    },
  })
