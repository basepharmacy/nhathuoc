import { queryOptions } from "@tanstack/react-query"
import { categoriesRepo } from '..'

export const getCategoriesQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ["categories", tenantId],
    queryFn: async () => {
      const categories = await categoriesRepo.getCategories(tenantId)
      return categories
    },
  })

export const getCategoriesWithActiveProductsCountQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ["categories", tenantId, "withActiveProductsCount"],
    queryFn: async () => {
      const categories = await categoriesRepo.getCategoriesWithActiveProductsCount(tenantId)
      return categories
    },
  })
