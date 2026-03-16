import { BasePharmacySupabaseClient } from '../../client'

export type SalesPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year'

export type PurchaseTopSupplier = {
  id?: string
  name: string
  orders: number
  orderAmount: number
  debt: number
}

export type PurchasesStatisticsResult = {
  totalOrders: number
  totalOrderAmount: number
  totalPaidAmount: number
  totalDebt: number
  topSuppliersByOrders: PurchaseTopSupplier[]
  topSuppliersByOrderAmount: PurchaseTopSupplier[]
  topSuppliersByDebt: PurchaseTopSupplier[]
}

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
}

export type TopProductType = 'by_quantity' | 'by_revenue' | 'by_profit'

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

type RpcSalesStatsV2Row = {
  current_completed_orders: number | null
  current_total_profit: number | null
  current_total_revenue: number | null
  current_total_loss: number | null
  previous_completed_orders: number | null
  previous_total_profit: number | null
  previous_total_revenue: number | null
  previous_total_loss: number | null
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
      const { data, error } = await client.rpc('get_sales_statistics_v2', {
        p_period: params.period,
        p_location_id: params.locationId ?? undefined,
      })

      if (error) {
        throw error
      }

      const stats = (data?.[0] ?? {}) as RpcSalesStatsV2Row
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
      }
    },

    async getTopProducts(params: {
      period: SalesPeriod
      type: TopProductType
      locationId?: string | null
      limit?: number
    }): Promise<SalesTopProduct[]> {
      const { data, error } = await client.rpc('get_top_products', {
        p_period: params.period,
        p_type: params.type,
        p_location_id: params.locationId ?? undefined,
        p_limit: params.limit ?? 5,
      })

      if (error) {
        throw error
      }

      return (data ?? []).map((item) => ({
        id: item.id,
        name: item.name ?? 'Không rõ',
        unitName: item.unit_name ?? 'đv',
        quantity: toNumber(item.quantity),
        revenue: toNumber(item.revenue),
        profit: toNumber(item.profit),
      }))
    },

    async getPurchasesStatistics(params: {
      locationId?: string | null
    }): Promise<PurchasesStatisticsResult> {
      const { data, error } = await client.rpc('get_purchases_statistics', {
        p_location_id: params.locationId ?? undefined,
      })

      if (error) {
        throw error
      }

      const stats = (data?.[0] ?? {}) as {
        total_orders?: number | null
        total_order_amount?: number | null
        total_paid_amount?: number | null
        total_debt?: number | null
        top_5_suppliers_by_orders?: unknown
        top_5_suppliers_by_order_amount?: unknown
        top_5_suppliers_by_debt?: unknown
      }

      const normalizeSuppliers = (value: unknown): PurchaseTopSupplier[] =>
        parseJsonArray(value).map((item) => ({
          id: (item.supplier_id ?? item.id) as string | undefined,
          name: String(item.supplier_name ?? item.name ?? 'Không rõ'),
          orders: toNumber(item.total_orders ?? item.orders ?? 0),
          orderAmount: toNumber(item.total_order_amount ?? item.order_amount ?? 0),
          debt: toNumber(item.total_debt ?? item.debt ?? 0),
        }))

      return {
        totalOrders: toNumber(stats.total_orders),
        totalOrderAmount: toNumber(stats.total_order_amount),
        totalPaidAmount: toNumber(stats.total_paid_amount),
        totalDebt: toNumber(stats.total_debt),
        topSuppliersByOrders: normalizeSuppliers(stats.top_5_suppliers_by_orders),
        topSuppliersByOrderAmount: normalizeSuppliers(stats.top_5_suppliers_by_order_amount),
        topSuppliersByDebt: normalizeSuppliers(stats.top_5_suppliers_by_debt),
      }
    },

    async getLowStockProducts(params: {
      locationId?: string | null
    }): Promise<LowStockProduct[]> {
      const { data, error } = await client.rpc('get_low_stock_products_v2', {
        p_location_id: params.locationId ?? undefined,
      })

      if (error) {
        throw error
      }

      return (data ?? []).map((item) => {
        const stock = toNumber(item.stock)
        return {
          name: item.product_name ?? 'Không rõ',
          stock,
          unitName: item.unit_name ?? 'đv',
          minStock: toNumber(item.min_stock),
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
