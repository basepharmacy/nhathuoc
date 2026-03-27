import { queryOptions } from "@tanstack/react-query"
import { inventoryBatchesRepo } from '..'
import type {
  InventoryBatchesListQueryInput,
  InventoryBatchesSummaryQueryInput,
  InventoryProductsListQueryInput,
} from '@/services/supabase/database/model'

export const getAllAvailableInventoryBatchesQueryOptions = (
  tenantId: string,
) =>
  queryOptions({
    queryKey: ["inventory-batches", tenantId, 'all', 'all-available'],
    queryFn: async () => {
      if (!tenantId) {
        return []
      }
      const batches = await inventoryBatchesRepo.getAllAvailableBatches({
        tenantId,
      })
      return batches
    },
    staleTime: 1 * 60 * 1000, // 1 min — critical for offline sale-order
  })

export const getInventoryBatchesQueryOptions = (
  tenantId: string,
  productIds: string[],
  locationId?: string | null
) =>
  queryOptions({
    queryKey: ["inventory-batches", tenantId, locationId ?? 'all', productIds],
    queryFn: async () => {
      if (!tenantId || productIds.length === 0) {
        return []
      }
      const batches = await inventoryBatchesRepo.getInventoryBatchesByProductIds({
        tenantId,
        productIds,
        locationId,
      })
      return batches
    },
  })

export const getInventoryBatchesListQueryOptions = (
  params: InventoryBatchesListQueryInput
) =>
  queryOptions({
    queryKey: [
      'inventory-batches',
      params.tenantId,
      'list',
      {
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        search: params.search ?? '',
        locationId: params.locationId ?? '',
        stockStatus: params.stockStatus ?? '',
        expiryStatus: params.expiryStatus ?? '',
        sortBy: params.sortBy ?? '',
        sortOrder: params.sortOrder ?? '',
      },
    ],
    queryFn: async () => {
      const result = await inventoryBatchesRepo.getInventoryBatchesList(params)
      return result
    },
  })

export const getInventoryProductsListQueryOptions = (
  params: InventoryProductsListQueryInput
) =>
  queryOptions({
    queryKey: [
      'inventory-products',
      params.tenantId,
      'list',
      {
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        search: params.search ?? '',
        locationId: params.locationId ?? '',
        stockStatus: params.stockStatus ?? '',
        expiryStatus: params.expiryStatus ?? '',
        sortBy: params.sortBy ?? '',
        sortOrder: params.sortOrder ?? '',
      },
    ],
    queryFn: async () => {
      const result = await inventoryBatchesRepo.getInventoryProductsList(params)
      return result
    },
  })

export const getInventoryBatchesSummaryQueryOptions = (
  params: InventoryBatchesSummaryQueryInput
) =>
  queryOptions({
    queryKey: [
      'inventory-batches',
      params.tenantId,
      'summary',
      {
        search: params.search ?? '',
        locationId: params.locationId ?? '',
      },
    ],
    queryFn: async () => {
      if (!params.tenantId) {
        return { totalBatches: 0, totalProducts: 0, totalQuantity: 0, totalValue: 0 }
      }
      const result = await inventoryBatchesRepo.getInventoryBatchesSummary(params)
      return result
    },
  })
