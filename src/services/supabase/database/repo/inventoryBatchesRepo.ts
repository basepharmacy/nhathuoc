import { BasePharmacySupabaseClient } from '../../client'
import type { Tables } from '../../database.types'
import { ProductStatus } from '../model'

export type InventoryBatch = Tables<'inventory_batches'>
export type InventoryBatchWithRelations = InventoryBatch & {
  products?: {
    id: string
    product_name: string
    status: ProductStatus
    product_units: {
      unit_name: string
      is_base_unit: boolean
      conversion_factor: number
    }[]
  } | null
  locations?: { id: string; name: string } | null
}

export type InventoryBatchStockStatus = 'in_stock' | 'out_of_stock'
export type InventoryBatchExpiryStatus = 'expired' | '7_days' | '1_month' | '3_months'

export type InventoryBatchesListQueryInput = {
  tenantId: string
  pageIndex: number
  pageSize: number
  search?: string
  locationIds?: string[]
  stockStatus?: InventoryBatchStockStatus
  expiryStatus?: InventoryBatchExpiryStatus
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
  totalBatches: number
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
  stockStatus?: InventoryBatchStockStatus
  expiryStatus?: InventoryBatchExpiryStatus
}

export type InventoryProductsListItem = {
  productId: string
  productName: string
  status: ProductStatus
  totalQuantity: number
  totalCumulativeQuantity: number
  averageCostPrice: number
  totalValue: number
  batchCount: number
  locations: string[]
  earliestExpiry: string | null
  base_unit_name: string
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

      const { data, error } = await client.rpc('get_inventory_statistics_v2', {
        p_location_id: locationId,
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
      const start = params.pageIndex * params.pageSize
      const end = start + params.pageSize - 1
      const searchValue = params.search?.trim()

      let query = client
        .from('inventory_batches')
        .select(
          `*, products!inner(id, product_name, status, product_units(unit_name, is_base_unit, conversion_factor)), locations(id, name)`,
          { count: 'exact' }
        )
        .eq('tenant_id', params.tenantId)

      if (params.locationIds?.length) {
        query = query.in('location_id', params.locationIds)
      }

      if (searchValue) {
        query = query.ilike('products.product_name', `%${searchValue}%`)
      }

      if (params.stockStatus === 'in_stock') {
        query = query.gt('quantity', 0)
      } else if (params.stockStatus === 'out_of_stock') {
        query = query.eq('quantity', 0)
      }

      if (params.expiryStatus) {
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]
        if (params.expiryStatus === 'expired') {
          query = query.not('expiry_date', 'is', null).lt('expiry_date', todayStr)
        } else {
          let daysAhead: number
          if (params.expiryStatus === '7_days') daysAhead = 7
          else if (params.expiryStatus === '1_month') daysAhead = 30
          else daysAhead = 90
          const futureDate = new Date(today)
          futureDate.setDate(futureDate.getDate() + daysAhead)
          const futureDateStr = futureDate.toISOString().split('T')[0]
          query = query.not('expiry_date', 'is', null).gte('expiry_date', todayStr).lte('expiry_date', futureDateStr)
        }
      }

      const { data, error, count } = await query
        .order('batch_code', { ascending: true })
        .range(start, end)

      if (error) {
        throw error
      }

      return {
        data: data ?? [],
        total: count ?? 0,
      }
    },
    async getInventoryProductsList(
      params: InventoryProductsListQueryInput
    ): Promise<InventoryProductsListQueryResult> {
      if (!params.tenantId) {
        return { data: [], total: 0 }
      }
      const start = params.pageIndex * params.pageSize
      const end = start + params.pageSize - 1
      const searchValue = params.search?.trim()

      let query = client
        .from('products')
        .select(
          `id, product_name, status, inventory_batches!inner(id, quantity, cumulative_quantity, average_cost_price, expiry_date, location_id, locations(name)), product_units(unit_name, is_base_unit, conversion_factor)`,
          { count: 'exact' }
        )
        .eq('tenant_id', params.tenantId)

      if (params.stockStatus === 'out_of_stock') {
        query = query.eq('inventory_batches.quantity', 0)
      } else {
        query = query.gt('inventory_batches.quantity', 0)
      }

      if (params.locationIds?.length) {
        query = query.in('inventory_batches.location_id', params.locationIds)
      }

      if (searchValue) {
        query = query.ilike('product_name', `%${searchValue}%`)
      }

      if (params.expiryStatus) {
        const today = new Date()
        const todayStr = today.toISOString().split('T')[0]
        if (params.expiryStatus === 'expired') {
          query = query.not('inventory_batches.expiry_date', 'is', null).lt('inventory_batches.expiry_date', todayStr)
        } else {
          let daysAhead: number
          if (params.expiryStatus === '7_days') daysAhead = 7
          else if (params.expiryStatus === '1_month') daysAhead = 30
          else daysAhead = 90
          const futureDate = new Date(today)
          futureDate.setDate(futureDate.getDate() + daysAhead)
          const futureDateStr = futureDate.toISOString().split('T')[0]
          query = query.not('inventory_batches.expiry_date', 'is', null).gte('inventory_batches.expiry_date', todayStr).lte('inventory_batches.expiry_date', futureDateStr)
        }
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
          status: product.status,
          totalQuantity,
          totalCumulativeQuantity,
          averageCostPrice,
          totalValue: averageCostPrice * totalQuantity,
          batchCount: batches.length,
          locations: Array.from(locations),
          earliestExpiry,
          base_unit_name: product.product_units?.find((unit) => unit.is_base_unit)?.unit_name ?? '',
        }
      })

      return {
        data: mapped,
        total: count ?? 0,
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
