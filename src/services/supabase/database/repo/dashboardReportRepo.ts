import { BasePharmacySupabaseClient } from '../../client'

export type SalesPeriod = 'day' | 'week' | 'month' | 'quarter' | 'year'

export type PurchaseTopSupplier = {
  id: string
  name: string
  statValue: number
}

export type PurchasesStatisticsResult = {
  totalOrders: number
  totalOrderAmount: number
  totalPaidAmount: number
  totalDebt: number
}

export type PurchasesStatisticsV2Result = {
  totalOrders: number
  totalOrderAmount: number
  totalPaidAmount: number
  totalDebt: number
}

export type TopSupplierType = 'by_orders' | 'by_order_amount' | 'by_debt'

export type TopPurchasedProductType = 'by_orders' | 'by_order_amount'

export type PurchaseTopProduct = {
  id?: string
  name: string
  statValue: number
}

export type SalesTopProduct = {
  id?: string
  name: string
  unitName: string
  quantity: number
  revenue: number
  profit: number
}

export type TopCustomer = {
  id: string
  name: string
  phone: string
  quantity: number
  revenue: number
  profit: number
}

export type TopCustomerType = 'by_quantity' | 'by_revenue' | 'by_profit'

export type TopCategory = {
  id: string
  name: string
  quantity: number
  revenue: number
  profit: number
}

export type TopCategoryType = 'by_quantity' | 'by_revenue' | 'by_profit'

export type SalesTimeSeriesGroupBy = 'hour' | 'day' | 'day_of_week'

export type SalesTimeSeriesType = 'by_revenue' | 'by_order_count' | 'by_profit'

export type SalesTimeSeriesItem = {
  timeKey: number
  quantity: number
  revenue: number
  orderCount: number
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

const calculateChange = (current: number, previous: number) => {
  if (previous === 0) {
    return current > 0 ? 100 : 0
  }
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

export type AdvanceSaleStatisticsResult = {
  returningCustomers: number
  returningCustomersChange: number
  profitMargin: number
  profitMarginChange: number
  returnRate: number
  returnRateChange: number
  avgSaleSpeed: number
  avgSaleSpeedChange: number
}

export type AdvancedPeriod = 'month' | 'quarter' | 'year'

export const createDashboardReportRepository = (
  client: BasePharmacySupabaseClient
) => {
  return {
    async getAdvanceSaleStatistics(params: {
      period: AdvancedPeriod
      referenceDate: string
      locationId?: string | null
    }): Promise<AdvanceSaleStatisticsResult> {
      const { data, error } = await client.rpc('get_advance_sale_statistics', {
        p_period: params.period,
        p_reference_date: params.referenceDate,
        p_location_id: params.locationId ?? undefined,
        p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })

      if (error) throw error

      const row = (data?.[0] ?? {}) as {
        current_returning_customers: number | null
        previous_returning_customers: number | null
        current_profit_margin: number | null
        previous_profit_margin: number | null
        current_return_rate: number | null
        previous_return_rate: number | null
        current_avg_sale_speed: number | null
        previous_avg_sale_speed: number | null
      }

      const currentReturning = toNumber(row.current_returning_customers)
      const previousReturning = toNumber(row.previous_returning_customers)
      const currentMargin = toNumber(row.current_profit_margin)
      const previousMargin = toNumber(row.previous_profit_margin)
      const currentReturnRate = toNumber(row.current_return_rate)
      const previousReturnRate = toNumber(row.previous_return_rate)
      const currentSpeed = toNumber(row.current_avg_sale_speed)
      const previousSpeed = toNumber(row.previous_avg_sale_speed)

      return {
        returningCustomers: currentReturning,
        returningCustomersChange: calculateChange(currentReturning, previousReturning),
        profitMargin: currentMargin,
        profitMarginChange: calculateChange(currentMargin, previousMargin),
        returnRate: currentReturnRate,
        returnRateChange: calculateChange(currentReturnRate, previousReturnRate),
        avgSaleSpeed: currentSpeed,
        avgSaleSpeedChange: calculateChange(currentSpeed, previousSpeed),
      }
    },

    async getAdvanceTopProducts(params: {
      period: AdvancedPeriod
      referenceDate: string
      type: TopProductType
      locationId?: string | null
      limit?: number
    }): Promise<SalesTopProduct[]> {
      const { data, error } = await client.rpc('get_top_products', {
        p_period: params.period,
        p_reference_date: params.referenceDate,
        p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        p_type: params.type,
        p_location_id: params.locationId ?? undefined,
        p_limit: params.limit ?? 5,
      })

      if (error) throw error

      return (data ?? []).map((item) => ({
        id: item.id,
        name: item.name ?? 'Không rõ',
        unitName: item.unit_name ?? 'đv',
        quantity: toNumber(item.quantity),
        revenue: toNumber(item.revenue),
        profit: toNumber(item.profit),
      }))
    },

    async getTopSlowSellProducts(params: {
      period: AdvancedPeriod
      referenceDate: string
      type: TopProductType
      locationId?: string | null
      limit?: number
    }): Promise<SalesTopProduct[]> {
      const { data, error } = await client.rpc('get_top_slow_sell_products', {
        p_period: params.period,
        p_reference_date: params.referenceDate,
        p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        p_type: params.type,
        p_location_id: params.locationId ?? undefined,
        p_limit: params.limit ?? 5,
      })

      if (error) throw error

      return (data ?? []).map((item) => ({
        id: item.id,
        name: item.name ?? 'Không rõ',
        unitName: item.unit_name ?? 'đv',
        quantity: toNumber(item.quantity_sold),
        revenue: toNumber(item.revenue),
        profit: toNumber(item.profit),
      }))
    },

    async getTopCustomers(params: {
      period: AdvancedPeriod
      referenceDate: string
      type: TopCustomerType
      locationId?: string | null
      limit?: number
    }): Promise<TopCustomer[]> {
      const { data, error } = await client.rpc('get_top_customers', {
        p_period: params.period,
        p_reference_date: params.referenceDate,
        p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        p_type: params.type,
        p_location_id: params.locationId ?? undefined,
        p_limit: params.limit ?? 5,
      })

      if (error) throw error

      return (data ?? []).map((item) => ({
        id: item.id,
        name: item.name ?? 'Không rõ',
        phone: item.phone ?? '',
        quantity: toNumber(item.quantity_sold),
        revenue: toNumber(item.revenue),
        profit: toNumber(item.profit),
      }))
    },

    async getTopCategories(params: {
      period: AdvancedPeriod
      referenceDate: string
      type: TopCategoryType
      locationId?: string | null
    }): Promise<TopCategory[]> {
      const { data, error } = await client.rpc('get_top_categories', {
        p_period: params.period,
        p_reference_date: params.referenceDate,
        p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        p_type: params.type,
        p_location_id: params.locationId ?? undefined,
      })

      if (error) throw error

      return (data ?? []).map((item) => ({
        id: item.id,
        name: item.name ?? 'Không rõ',
        quantity: toNumber(item.quantity_sold),
        revenue: toNumber(item.revenue),
        profit: toNumber(item.profit),
      }))
    },

    async getSalesTimeSeries(params: {
      period: AdvancedPeriod
      referenceDate: string
      groupBy: SalesTimeSeriesGroupBy
      type: SalesTimeSeriesType
      locationId?: string | null
    }): Promise<SalesTimeSeriesItem[]> {
      const { data, error } = await client.rpc('get_sales_time_series', {
        p_period: params.period,
        p_reference_date: params.referenceDate,
        p_group_by: params.groupBy,
        p_type: params.type,
        p_location_id: params.locationId ?? undefined,
        p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })

      if (error) throw error

      return (data ?? []).map((item) => ({
        timeKey: item.time_key,
        quantity: toNumber(item.quantity),
        revenue: toNumber(item.revenue),
        orderCount: item.order_count,
        profit: toNumber(item.profit),
      }))
    },

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
    async getPurchasesStatisticsV2(params: {
      locationId?: string | null
      supplierId?: string
      purchasePeriodId?: number
    }): Promise<PurchasesStatisticsV2Result> {
      const { data, error } = await client.rpc('get_purchases_statistics_v2', {
        p_location_id: params.locationId ?? undefined,
        p_supplier_id: params.supplierId ?? undefined,
        p_purchase_period_id: params.purchasePeriodId ?? undefined,
      })

      if (error) {
        throw error
      }

      const stats = (data?.[0] ?? {}) as {
        total_orders?: number | null
        total_order_amount?: number | null
        total_paid_amount?: number | null
        total_debt?: number | null
      }

      return {
        totalOrders: toNumber(stats.total_orders),
        totalOrderAmount: toNumber(stats.total_order_amount),
        totalPaidAmount: toNumber(stats.total_paid_amount),
        totalDebt: toNumber(stats.total_debt),
      }
    },

    async getTopSuppliers(params: {
      locationId?: string | null
      type: TopSupplierType
      purchasePeriodId?: number
    }): Promise<PurchaseTopSupplier[]> {
      const { data, error } = await client.rpc('get_top_suppliers', {
        p_location_id: params.locationId ?? undefined,
        p_type: params.type,
        p_purchase_period_id: params.purchasePeriodId ?? undefined,
      })

      if (error) {
        throw error
      }

      return (data ?? []).map((item: Record<string, unknown>) => ({
        id: (item.supplier_id) as string,
        name: String(item.name),
        statValue: toNumber(item.stat_value)
      }))
    },

    async getTopPurchasedProducts(params: {
      locationId?: string | null
      type: TopPurchasedProductType
      purchasePeriodId?: number
    }): Promise<PurchaseTopProduct[]> {
      const { data, error } = await client.rpc('get_top_purchased_products', {
        p_location_id: params.locationId ?? undefined,
        p_type: params.type,
        p_purchase_period_id: params.purchasePeriodId ?? undefined,
      })

      if (error) {
        throw error
      }

      return (data ?? []).map((item: Record<string, unknown>) => ({
        id: (item.product_id) as string | undefined,
        name: String(item.product_name ?? 'Không rõ'),
        statValue: toNumber(item.stat_value)
      }))
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
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
      let query = client
        .from('inventory_batches')
        .select(
          `id, batch_code, expiry_date, quantity, product_id, location_id, tenant_id, products!inner(id, product_name, product_units(unit_name, is_base_unit))`
        )
        .eq('tenant_id', params.tenantId)
        .gt('quantity', 0)
        .not('expiry_date', 'is', null)
        .lt('expiry_date', today)
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
