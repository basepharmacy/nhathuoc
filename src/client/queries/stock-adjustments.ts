import { queryOptions } from "@tanstack/react-query"
import { stockAdjustmentsRepo } from '..'
import type { StockAdjustmentsListQueryInput } from '@/services/supabase/database/model'

export const getStockAdjustmentsListQueryOptions = (
  params: StockAdjustmentsListQueryInput
) =>
  queryOptions({
    queryKey: [
      'stock-adjustments',
      params.tenantId,
      'list',
      {
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        search: params.search ?? '',
        locationId: params.locationId ?? '',
        reasonCodes: params.reasonCodes ?? [],
        adjustmentTypes: params.adjustmentTypes ?? [],
        fromDate: params.fromDate ?? '',
        toDate: params.toDate ?? '',
      },
    ],
    queryFn: async () => {
      if (!params.tenantId) {
        return { data: [], total: 0 }
      }
      const result = await stockAdjustmentsRepo.getStockAdjustmentsList(params)
      return result
    },
  })
