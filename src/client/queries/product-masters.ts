import { queryOptions } from "@tanstack/react-query"
import { productMastersRepo } from '..'

export type ProductMastersBySourceQueryInput = {
  source: string
  search?: string
  pageIndex: number
  pageSize: number
}

export const getProductMastersBySourceQueryOptions = (
  params: ProductMastersBySourceQueryInput
) =>
  queryOptions({
    queryKey: [
      'product-masters',
      params.source,
      {
        search: params.search ?? '',
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
      },
    ],
    queryFn: async () => {
      const result = await productMastersRepo.getBySource(params)
      return result
    },
  })
