import { queryOptions } from "@tanstack/react-query"
import { suppliersRepo } from '..'

export const getSuppliersQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ["suppliers", tenantId],
    queryFn: async () => {
      const suppliers = await suppliersRepo.getAllSuppliersByTenantId(tenantId)
      return suppliers
    },
  })

export const getSupplierDetailQueryOptions = (
  tenantId: string,
  supplierId: string
) =>
  queryOptions({
    queryKey: ["suppliers", tenantId, "detail", supplierId],
    queryFn: async () => {
      if (!tenantId || !supplierId) {
        return null
      }
      const supplier = await suppliersRepo.getSupplierById({
        tenantId,
        supplierId,
      })
      return supplier
    },
  })
