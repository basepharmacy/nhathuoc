import { queryOptions } from "@tanstack/react-query"
import { purchasePeriodsRepo } from '..'

export const getPurchasePeriodsQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ["purchase-periods", tenantId],
    queryFn: async () => {
      const periods = await purchasePeriodsRepo.getPurchasePeriodsByTenantId(tenantId)
      return periods
    },
    staleTime: 5 * 60 * 1000,
  })
