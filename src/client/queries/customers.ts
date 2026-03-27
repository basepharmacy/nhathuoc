import { queryOptions } from "@tanstack/react-query"
import { customersRepo } from '..'

export const getCustomersQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ["customers", tenantId],
    queryFn: async () => {
      const customers = await customersRepo.getAllCustomersByTenantId(tenantId)
      return customers
    },
    staleTime: 5 * 60 * 1000, // 5 min — critical for offline sale-order
  })

export const getCustomerDetailQueryOptions = (
  tenantId: string,
  customerId: string
) =>
  queryOptions({
    queryKey: ["customers", tenantId, "detail", customerId],
    queryFn: async () => {
      if (!tenantId || !customerId) {
        return null
      }
      const customer = await customersRepo.getCustomerById({
        tenantId,
        customerId,
      })
      return customer
    },
  })
