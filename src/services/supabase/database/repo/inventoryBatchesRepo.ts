import { BasePharmacySupabaseClient } from '../../client'
import type { Tables } from '../../database.types'
import { ProductStatus } from '../model'

export type InventoryBatch = Tables<'inventory_batches'>


export type InventoryBatchStockStatus = 'in_stock' | 'out_of_stock'
export type InventoryBatchExpiryStatus = 'expired' | '7_days' | '1_month' | '3_months'

export type InventoryBatchSortField = 'expiry_date' | 'quantity' | 'cumulative_quantity' | 'average_cost_price'

export type InventoryBatchesListQueryInput = {
  tenantId: string
  pageIndex: number
  pageSize: number
  search?: string
  locationId?: string
  stockStatus?: InventoryBatchStockStatus
  expiryStatus?: InventoryBatchExpiryStatus
  sortBy?: InventoryBatchSortField
  sortOrder?: 'asc' | 'desc'
}

type ProductUnit = {
  unit_name: string
  is_base_unit: boolean
  conversion_factor: number
}

export type InventoryBatchWithRelations = {
  id: string
  batch_code: string
  product_id: string
  location_id: string
  tenant_id: string
  quantity: number
  cumulative_quantity: number
  average_cost_price: number
  expiry_date: string
  created_at: string
  updated_at: string
  product_name: string
  product_status: ProductStatus
  product_units: ProductUnit[]
  location_name: string
  total: number
}

export type InventoryBatchesListQueryResult = {
  data: InventoryBatchWithRelations[]
  total: number
}

export type InventoryBatchesSummaryQueryInput = {
  tenantId: string
  search?: string
  locationId?: string
}

export type InventoryBatchesSummary = {
  totalBatches: number
  totalProducts: number
  totalQuantity: number
  totalValue: number
}

export type InventoryProductSortField = 'nearest_expiry_date' | 'quantity' | 'cumulative_quantity' | 'average_cost_price' | 'batch_numbers'

export type InventoryProductsListQueryInput = {
  tenantId: string
  pageIndex: number
  pageSize: number
  search?: string
  locationId?: string
  stockStatus?: InventoryBatchStockStatus
  expiryStatus?: InventoryBatchExpiryStatus
  sortBy?: InventoryProductSortField
  sortOrder?: 'asc' | 'desc'
}

export type InventoryProductsListItem = {
  id: string
  product_name: string
  product_status: ProductStatus
  quantity: number
  cumulative_quantity: number
  average_cost_price: number
  batch_numbers: number
  location_id: string
  location_name: string
  nearest_expiry_date: string
  product_units: ProductUnit[]
  tenant_id: string
  created_at: string
  updated_at: string
  total: number
}

export type InventoryProductsListQueryResult = {
  data: InventoryProductsListItem[]
  total: number
}

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
          product_units: (row.product_units ?? []) as ProductUnit[],
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
          product_units: (row.product_units ?? []) as ProductUnit[],
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
  }
}
