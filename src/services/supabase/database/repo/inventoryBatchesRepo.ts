import { BasePharmacySupabaseClient } from '../../client'
import {
  InventoryBatch,
  InventoryBatchInsert,
  InventoryBatchProductUnit,
  InventoryBatchesListQueryInput,
  InventoryBatchesListQueryResult,
  InventoryBatchesSummaryQueryInput,
  InventoryBatchesSummary,
  InventoryProductsListQueryInput,
  InventoryProductsListQueryResult,
} from '../model'

export const createInventoryBatchRepository = (
  client: BasePharmacySupabaseClient
) => {
  return {
    async getInventoryBatchesSummary(
      params: InventoryBatchesSummaryQueryInput
    ): Promise<InventoryBatchesSummary> {
      const { data, error } = await client.rpc('get_inventory_statistics_v2', {
        p_location_id: params.locationId,
      })

      if (error) {
        throw error
      }

      const stats = data?.[0]

      return {
        totalBatches: stats?.total_batches ?? 0,
        totalProducts: stats?.total_products ?? 0,
        totalQuantity: stats?.total_quantity ?? 0,
        totalValue: stats?.total_value ?? 0,
      }
    },
    async getInventoryBatchesList(
      params: InventoryBatchesListQueryInput
    ): Promise<InventoryBatchesListQueryResult> {
      if (!params.tenantId) {
        return { data: [], total: 0 }
      }

      const { data, error } = await client.rpc('get_inventory_batches_list', {
        p_page_index: params.pageIndex,
        p_page_size: params.pageSize,
        p_search: params.search?.trim() || undefined,
        p_location_id: params.locationId,
        p_stock_status: params.stockStatus,
        p_expiry_status: params.expiryStatus,
        p_sort_by: params.sortBy,
        p_sort_order: params.sortOrder,
      })

      if (error) {
        throw error
      }

      const rows = data ?? []
      const total = rows[0]?.total ?? 0

      return {
        data: rows.map((row) => ({
          ...row,
          product_units: (row.product_units ?? []) as InventoryBatchProductUnit[],
        })),
        total,
      }
    },
    async getInventoryProductsList(
      params: InventoryProductsListQueryInput
    ): Promise<InventoryProductsListQueryResult> {
      if (!params.tenantId) {
        return { data: [], total: 0 }
      }

      const { data, error } = await client.rpc('get_inventory_products_list', {
        p_page_index: params.pageIndex,
        p_page_size: params.pageSize,
        p_search: params.search?.trim() || undefined,
        p_location_id: params.locationId,
        p_stock_status: params.stockStatus,
        p_expiry_status: params.expiryStatus,
        p_sort_by: params.sortBy,
        p_sort_order: params.sortOrder,
      })

      if (error) {
        throw error
      }

      const rows = data ?? []
      const total = rows[0]?.total ?? 0

      return {
        data: rows.map((row) => ({
          ...row,
          product_units: (row.product_units ?? []) as InventoryBatchProductUnit[],
        })),
        total,
      }
    },
    async getAllAvailableBatches(params: {
      tenantId: string
      locationId?: string | null
    }): Promise<InventoryBatch[]> {
      let query = client
        .from('inventory_batches')
        .select('id, batch_code, expiry_date, quantity, product_id, location_id, tenant_id')
        .eq('tenant_id', params.tenantId)
        .gt('quantity', 0)

      if (params.locationId) {
        query = query.eq('location_id', params.locationId)
      }

      // Only include batches that are not expired or have no expiry date
      const today = new Date().toISOString().split('T')[0]
      query = query.or(`expiry_date.is.null,expiry_date.gte.${today}`)

      const { data, error } = await query
        .order('expiry_date', { ascending: true })
        .order('batch_code', { ascending: true })

      if (error) {
        throw error
      }

      return (data ?? []) as InventoryBatch[]
    },
    async getInventoryBatchesByProductIds(params: {
      tenantId: string
      productIds: string[]
      locationId?: string | null
      pageIndex?: number
      pageSize?: number
    }): Promise<InventoryBatch[]> {
      if (params.productIds.length === 0) {
        return []
      }

      let query = client
        .from('inventory_batches')
        .select('id, batch_code, expiry_date, quantity, product_id, location_id, tenant_id')
        .eq('tenant_id', params.tenantId)
        .in('product_id', params.productIds)

      if (params.locationId) {
        query = query.eq('location_id', params.locationId)
      }

      if (params.pageIndex !== undefined && params.pageSize !== undefined) {
        const start = params.pageIndex * params.pageSize
        const end = start + params.pageSize - 1
        query = query.range(start, end)
      }

      const { data, error } = await query
        .order('expiry_date', { ascending: true })
        .order('batch_code', { ascending: true })

      if (error) {
        throw error
      }

      return (data ?? []) as InventoryBatch[]
    },
    async createBatchInventoryBatches(
      params: InventoryBatchInsert[]
    ): Promise<InventoryBatch[]> {
      const { data, error } = await client
        .from('inventory_batches')
        .insert(params)
        .select()

      if (error) {
        throw error
      }

      return (data ?? []) as InventoryBatch[]
    },
  }
}
