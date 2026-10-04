import { queryOptions } from "@tanstack/react-query"
import { productsRepo } from '..'

export const getProductsQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ["products", tenantId],
    queryFn: async () => {
      const products = await productsRepo.getAllProductsByTenantId(tenantId)
      return products
    },
    staleTime: 5 * 60 * 1000, // 5 min — critical for offline sale-order
  })

export const getProductUnitUsageQueryOptions = (
  tenantId: string,
  productId: string,
) =>
  queryOptions({
    queryKey: ['products', tenantId, 'unit-usage', productId],
    queryFn: async () => {
      if (!tenantId || !productId) {
        return []
      }
      return productsRepo.getProductUnitUsage(productId)
    },
    staleTime: 60 * 1000,
  })
