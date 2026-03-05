import { BasePharmacySupabaseClient } from '../../client'
import type { Tables, TablesInsert } from '../../database.types'

export type StockAdjustment = Tables<'stock_adjustments'>
export type StockAdjustmentInsert = TablesInsert<'stock_adjustments'>
export type StockAdjustmentWithRelations = StockAdjustment & {
  products?: { id: string; product_name: string } | null
  locations?: { id: string; name: string } | null
}

export type StockAdjustmentsListQueryInput = {
  tenantId: string
  pageIndex: number
  pageSize: number
  search?: string
  locationIds?: string[]
  reasonCodes?: StockAdjustment['reason_code'][]
  adjustmentTypes?: Array<'increase' | 'decrease'>
}

export type StockAdjustmentsListQueryResult = {
  data: StockAdjustmentWithRelations[]
  total: number
}

export const createStockAdjustmentRepository = (
  client: BasePharmacySupabaseClient
) => {
  return {
    async getStockAdjustmentsList(
      params: StockAdjustmentsListQueryInput
    ): Promise<StockAdjustmentsListQueryResult> {
      const start = params.pageIndex * params.pageSize
      const end = start + params.pageSize - 1
      const searchValue = params.search?.trim()

      let query = client
        .from('stock_adjustments')
        .select(
          `id, batch_code, expiry_date, quantity, cost_price, reason, reason_code, product_id, location_id, tenant_id, created_at, products!inner(id, product_name), locations(id, name)`,
          { count: 'exact' }
        )
        .eq('tenant_id', params.tenantId)

      if (params.locationIds?.length) {
        query = query.in('location_id', params.locationIds)
      }

      if (searchValue) {
        query = query.ilike('products.product_name', `%${searchValue}%`)
      }

      if (params.reasonCodes?.length) {
        query = query.in('reason_code', params.reasonCodes)
      }

      const hasIncrease = params.adjustmentTypes?.includes('increase') ?? false
      const hasDecrease = params.adjustmentTypes?.includes('decrease') ?? false

      if (hasIncrease && !hasDecrease) {
        query = query.gt('quantity', 0)
      }

      if (!hasIncrease && hasDecrease) {
        query = query.lt('quantity', 0)
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range(start, end)

      if (error) {
        throw error
      }

      return {
        data: (data ?? []) as StockAdjustmentWithRelations[],
        total: count ?? 0,
      }
    },

    async createStockAdjustment(
      params: StockAdjustmentInsert
    ): Promise<StockAdjustment> {
      const { data, error } = await client
        .from('stock_adjustments')
        .insert(params)
        .select()
        .single()

      if (error) {
        throw error
      }

      return data as StockAdjustment
    },

    async deleteStockAdjustment(id: string): Promise<void> {
      const { error } = await client
        .from('stock_adjustments')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }
    },
  }
}
