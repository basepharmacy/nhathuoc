import { BasePharmacySupabaseClient } from '../../client'
import type { Tables } from '../../database.types'

export type InventoryBatch = Tables<'inventory_batches'>
export type InventoryBatchWithRelations = InventoryBatch & {
  products?: { id: string; product_name: string } | null
  locations?: { id: string; name: string } | null
}

export type InventoryBatchesListQueryInput = {
  tenantId: string
  pageIndex: number
  pageSize: number
  search?: string
  locationIds?: string[]
}

export type InventoryBatchesListQueryResult = {
  data: InventoryBatchWithRelations[]
  total: number
}

export type InventoryBatchesSummaryQueryInput = {
  tenantId: string
  search?: string
  locationIds?: string[]
}

export type InventoryBatchesSummary = {
  totalProducts: number
  totalQuantity: number
  totalValue: number
}

export type InventoryProductsListQueryInput = {
  tenantId: string
  pageIndex: number
  pageSize: number
  search?: string
  locationIds?: string[]
}

export type InventoryProductsListItem = {
  productId: string
  productName: string
  totalQuantity: number
  totalCumulativeQuantity: number
  averageCostPrice: number
  totalValue: number
  batchCount: number
  locations: string[]
  earliestExpiry: string | null
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
      const locationId = params.locationIds?.length === 1
        ? params.locationIds[0]
        : undefined

      const { data, error } = await client.rpc('get_inventory_statistics', {
        p_location_id: locationId,
      })

      if (error) {
        throw error
      }

      const stats = data?.[0]

      return {
        totalProducts: stats?.total_products ?? 0,
        totalQuantity: stats?.total_quantity ?? 0,
        totalValue: stats?.total_value ?? 0,
      }
    },
    async getInventoryBatchesList(
      params: InventoryBatchesListQueryInput
    ): Promise<InventoryBatchesListQueryResult> {
      const start = params.pageIndex * params.pageSize
      const end = start + params.pageSize - 1
      const searchValue = params.search?.trim()

      let query = client
        .from('inventory_batches')
        .select(
          `id, batch_code, expiry_date, quantity, cumulative_quantity, average_cost_price, product_id, location_id, tenant_id, updated_at, products!inner(id, product_name), locations(id, name)`,
          { count: 'exact' }
        )
        .eq('tenant_id', params.tenantId)

      if (params.locationIds?.length) {
        query = query.in('location_id', params.locationIds)
      }

      if (searchValue) {
        query = query.ilike('products.product_name', `%${searchValue}%`)
      }

      const { data, error, count } = await query
        .order('updated_at', { ascending: false })
        .order('batch_code', { ascending: true })
        .range(start, end)

      if (error) {
        throw error
      }

      return {
        data: (data ?? []) as InventoryBatchWithRelations[],
        total: count ?? 0,
      }
    },
    async getInventoryProductsList(
      params: InventoryProductsListQueryInput
    ): Promise<InventoryProductsListQueryResult> {
      const start = params.pageIndex * params.pageSize
      const end = start + params.pageSize - 1
      const searchValue = params.search?.trim()

      let query = client
        .from('products')
        .select(
          `id, product_name, inventory_batches!inner(id, quantity, cumulative_quantity, average_cost_price, expiry_date, location_id, locations(name))`,
          { count: 'exact' }
        )
        .eq('tenant_id', params.tenantId)
        .gt('inventory_batches.quantity', 0)

      if (params.locationIds?.length) {
        query = query.in('inventory_batches.location_id', params.locationIds)
      }

      if (searchValue) {
        query = query.ilike('product_name', `%${searchValue}%`)
      }

      const { data, error, count } = await query
        .order('product_name', { ascending: true })
        .range(start, end)

      if (error) {
        throw error
      }

      const mapped = (data ?? []).map((product) => {
        const batches = product.inventory_batches ?? []
        let totalQuantity = 0
        let totalCumulativeQuantity = 0
        let totalValue = 0
        let earliestExpiry: string | null = null
        const locations = new Set<string>()

        batches.forEach((batch) => {
          const quantity = batch.quantity ?? 0
          const cumulativeQuantity = batch.cumulative_quantity ?? 0
          const averageCostPrice = batch.average_cost_price ?? 0
          totalQuantity += quantity
          totalCumulativeQuantity += cumulativeQuantity
          totalValue += quantity * averageCostPrice

          const locationName = batch.locations?.name
          if (locationName) {
            locations.add(locationName)
          }

          if (batch.expiry_date) {
            if (!earliestExpiry || new Date(batch.expiry_date) < new Date(earliestExpiry)) {
              earliestExpiry = batch.expiry_date
            }
          }
        })

        const averageCostPrice = totalQuantity > 0 ? totalValue / totalQuantity : 0

        return {
          productId: product.id,
          productName: product.product_name ?? 'Không rõ',
          totalQuantity,
          totalCumulativeQuantity,
          averageCostPrice,
          totalValue: averageCostPrice * totalQuantity,
          batchCount: batches.length,
          locations: Array.from(locations),
          earliestExpiry,
        }
      })

      return {
        data: mapped,
        total: count ?? 0,
      }
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
