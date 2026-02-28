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

export const createInventoryBatchRepository = (
  client: BasePharmacySupabaseClient
) => {
  return {
    async getInventoryBatchesSummary(
      params: InventoryBatchesSummaryQueryInput
    ): Promise<InventoryBatchesSummary> {
      const searchValue = params.search?.trim()

      let query = client
        .from('inventory_batches')
        .select(
          'product_id, quantity, batch_code, products(product_name, product_units(cost_price, is_base_unit))'
        )
        .eq('tenant_id', params.tenantId)

      if (params.locationIds?.length) {
        query = query.in('location_id', params.locationIds)
      }

      if (searchValue) {
        query = query.or(
          `batch_code.ilike.%${searchValue}%,products.product_name.ilike.%${searchValue}%`
        )
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      const items = (data ?? []) as Array<{
        product_id: string
        quantity: number | null
        products?: {
          product_units?: Array<{ cost_price: number | null; is_base_unit: boolean | null }>
        } | null
      }>

      const productIds = new Set<string>()
      let totalQuantity = 0
      let totalValue = 0

      items.forEach((row) => {
        productIds.add(row.product_id)
        const quantity = row.quantity ?? 0
        totalQuantity += quantity

        const units = row.products?.product_units ?? []
        const baseUnit = units.find((unit) => unit.is_base_unit) ?? units[0]
        const costPrice = baseUnit?.cost_price ?? 0
        totalValue += quantity * costPrice
      })

      return {
        totalProducts: productIds.size,
        totalQuantity,
        totalValue,
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
          'id, batch_code, expiry_date, quantity, product_id, location_id, tenant_id, updated_at, products(id, product_name), locations(id, name)',
          { count: 'exact' }
        )
        .eq('tenant_id', params.tenantId)

      if (params.locationIds?.length) {
        query = query.in('location_id', params.locationIds)
      }

      if (searchValue) {
        query = query.or(
          `batch_code.ilike.%${searchValue}%,products.product_name.ilike.%${searchValue}%`
        )
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
    async getInventoryBatchesByProductIds(params: {
      tenantId: string
      productIds: string[]
      locationId?: string | null
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
