import { BasePharmacySupabaseClient } from '../../client'
import type { Json } from '../../database.types'

export type SalesPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year'

export type SalesTopProduct = {
  id?: string
  name: string
  unitName: string
  quantity: number
  revenue: number
  profit: number
}

export type SalesStatisticsResult = {
  revenue: number
  profit: number
  orders: number
  stockLossAmount: number
  revenueChange: number
  profitChange: number
  ordersChange: number
  stockLossChange: number
  topProducts: SalesTopProduct[]
}

export type LowStockProduct = {
  name: string
  stock: number
  unitName: string
  minStock?: number
  status: 'out' | 'low'
}

export type ExpiredInventoryBatch = {
  id: string
  name: string
  batch: string
  expiredAt: string
  quantity: number
  unitName: string
}

type RpcSalesStatsRow = {
  current_completed_orders: number | null
  current_total_profit: number | null
  current_total_revenue: number | null
  current_total_loss: number | null
  previous_completed_orders: number | null
  previous_total_profit: number | null
  previous_total_revenue: number | null
  previous_total_loss: number | null
  top_5_products_by_profit?: Json | null
  top_5_products_by_quantity?: Json | null
  top_5_products_by_revenue?: Json | null
}

const toNumber = (value: unknown) => {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const parseJsonArray = (value: unknown): Record<string, unknown>[] => {
  if (!value) return []
  if (Array.isArray(value)) return value as Record<string, unknown>[]
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : []
    } catch {
      return []
    }
  }
  return []
}

const normalizeTopProducts = (value: unknown): SalesTopProduct[] =>
  parseJsonArray(value).map((item) => ({
    id: (item.product_id ?? item.productId ?? item.id) as string | undefined,
    name: String(item.product_name ?? item.name ?? 'Không rõ'),
    unitName: String(item.unit_name ?? item.unitName ?? 'đv'),
    quantity: toNumber(item.total_quantity ?? item.quantity ?? 0),
    revenue: toNumber(item.total_revenue ?? item.revenue ?? 0),
    profit: toNumber(item.total_profit ?? item.profit ?? 0),
  }))

const buildTopProducts = (stats: RpcSalesStatsRow): SalesTopProduct[] => {
  const quantityList = normalizeTopProducts(stats.top_5_products_by_quantity)
  const revenueList = normalizeTopProducts(stats.top_5_products_by_revenue)
  const profitList = normalizeTopProducts(stats.top_5_products_by_profit)
  const orderList =
    quantityList.length > 0
      ? quantityList
      : revenueList.length > 0
        ? revenueList
        : profitList

  const merged = new Map<string, SalesTopProduct>()

  const upsert = (item: SalesTopProduct) => {
    const key = item.id ?? item.name
    const existing = merged.get(key)
    if (!existing) {
      merged.set(key, { ...item })
      return
    }
    merged.set(key, {
      ...existing,
      name: item.name || existing.name,
      unitName: item.unitName || existing.unitName,
      quantity: item.quantity || existing.quantity,
      revenue: item.revenue || existing.revenue,
      profit: item.profit || existing.profit,
    })
  }

  quantityList.forEach(upsert)
  revenueList.forEach(upsert)
  profitList.forEach(upsert)

  return orderList.map((item) => merged.get(item.id ?? item.name) ?? item)
}

const calculateChange = (current: number, previous: number) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

export const createDashboardReportRepository = (
  client: BasePharmacySupabaseClient
) => {
  return {
    async getSalesStatistics(params: {
      period: SalesPeriod
      locationId?: string | null
    }): Promise<SalesStatisticsResult> {
      const { data, error } = await client.rpc('get_sales_statistics', {
        p_period: params.period,
        p_location_id: params.locationId ?? undefined,
      })

      if (error) {
        throw error
      }

      const stats = (data?.[0] ?? {}) as RpcSalesStatsRow
      const currentRevenue = toNumber(stats.current_total_revenue)
      const currentProfit = toNumber(stats.current_total_profit)
      const currentOrders = toNumber(stats.current_completed_orders)
      const currentLoss = toNumber(stats.current_total_loss)
      const previousRevenue = toNumber(stats.previous_total_revenue)
      const previousProfit = toNumber(stats.previous_total_profit)
      const previousOrders = toNumber(stats.previous_completed_orders)
      const previousLoss = toNumber(stats.previous_total_loss)

      return {
        revenue: currentRevenue,
        profit: currentProfit,
        orders: currentOrders,
        stockLossAmount: currentLoss,
        revenueChange: calculateChange(currentRevenue, previousRevenue),
        profitChange: calculateChange(currentProfit, previousProfit),
        ordersChange: calculateChange(currentOrders, previousOrders),
        stockLossChange: calculateChange(currentLoss, previousLoss),
        topProducts: buildTopProducts(stats),
      }
    },

    async getLowStockProducts(params: {
      locationId?: string | null
    }): Promise<LowStockProduct[]> {
      const { data, error } = await client.rpc('get_low_stock_products', {
        p_location_id: params.locationId ?? undefined,
      })

      if (error) {
        throw error
      }

      const list = parseJsonArray(data as unknown)

      return list.map((item) => {
        const stock = toNumber(item.total_quantity ?? item.quantity ?? item.stock ?? 0)
        const minStock = toNumber(item.min_stock ?? item.minStock ?? 0)
        return {
          name: String(item.product_name ?? item.name ?? 'Không rõ'),
          stock,
          unitName: String(item.unit_name ?? item.unitName ?? 'đv'),
          minStock,
          status: stock <= 0 ? 'out' : 'low',
        }
      })
    },

    async getExpiredInventoryBatches(params: {
      tenantId: string
      locationId?: string | null
      limit?: number
      now?: Date
    }): Promise<ExpiredInventoryBatch[]> {
      const now = params.now ?? new Date()
      let query = client
        .from('inventory_batches')
        .select(
          `id, batch_code, expiry_date, quantity, product_id, location_id, tenant_id, products!inner(id, product_name, product_units(unit_name, is_base_unit))`
        )
        .eq('tenant_id', params.tenantId)
        .gt('quantity', 0)
        .not('expiry_date', 'is', null)
        .lt('expiry_date', now.toISOString())
        .order('expiry_date', { ascending: true })

      if (params.locationId) {
        query = query.eq('location_id', params.locationId)
      }

      if (params.limit) {
        query = query.limit(params.limit)
      }

      const { data, error } = await query

      if (error) {
        throw error
      }

      const rows = (data ?? []) as Array<{
        id: string
        batch_code: string | null
        expiry_date: string | null
        quantity: number | null
        products?: {
          product_name?: string | null
          product_units?: { unit_name: string; is_base_unit: boolean }[] | null
        } | null
      }>

      return rows.map((row) => {
        const product = row.products ?? undefined
        const unitName =
          product?.product_units?.find((unit) => unit.is_base_unit)?.unit_name ??
          product?.product_units?.[0]?.unit_name ??
          'đv'

        return {
          id: row.id,
          name: product?.product_name ?? 'Không rõ',
          batch: row.batch_code ?? 'N/A',
          expiredAt: row.expiry_date ?? '',
          quantity: row.quantity ?? 0,
          unitName,
        }
      })
    },

  }
}
