import { queryOptions } from "@tanstack/react-query"
import { dashboardReportRepo } from '..'
import type {
  SalesPeriod,
  TopProductType,
  TopSupplierType,
  TopPurchasedProductType,
  AdvancedPeriod,
  TopCustomerType,
  TopCategoryType,
  SalesTimeSeriesGroupBy,
  SalesTimeSeriesType,
} from '@/services/supabase/database/model'

export const getAdvanceSaleStatisticsQueryOptions = (params: {
  period: AdvancedPeriod
  referenceDate: string
  locationId?: string | null
}) =>
  queryOptions({
    queryKey: ['dashboard-report', 'advance-sale-statistics', params.period, params.referenceDate, params.locationId ?? 'all'],
    queryFn: async () =>
      dashboardReportRepo.getAdvanceSaleStatistics({
        period: params.period,
        referenceDate: params.referenceDate,
        locationId: params.locationId ?? undefined,
      }),
  })

export const getAdvanceTopProductsQueryOptions = (params: {
  period: AdvancedPeriod
  referenceDate: string
  type: TopProductType
  locationId?: string | null
  limit?: number
}) =>
  queryOptions({
    queryKey: ['dashboard-report', 'advance-top-products', params.period, params.referenceDate, params.type, params.locationId ?? 'all', params.limit ?? 5],
    queryFn: async () =>
      dashboardReportRepo.getAdvanceTopProducts({
        period: params.period,
        referenceDate: params.referenceDate,
        type: params.type,
        locationId: params.locationId ?? undefined,
        limit: params.limit,
      }),
  })

export const getTopSlowSellProductsQueryOptions = (params: {
  period: AdvancedPeriod
  referenceDate: string
  type: TopProductType
  locationId?: string | null
  limit?: number
}) =>
  queryOptions({
    queryKey: ['dashboard-report', 'top-slow-sell-products', params.period, params.referenceDate, params.type, params.locationId ?? 'all', params.limit ?? 5],
    queryFn: async () =>
      dashboardReportRepo.getTopSlowSellProducts({
        period: params.period,
        referenceDate: params.referenceDate,
        type: params.type,
        locationId: params.locationId ?? undefined,
        limit: params.limit,
      }),
  })

export const getTopCustomersQueryOptions = (params: {
  period: AdvancedPeriod
  referenceDate: string
  type: TopCustomerType
  locationId?: string | null
  limit?: number
}) =>
  queryOptions({
    queryKey: ['dashboard-report', 'top-customers', params.period, params.referenceDate, params.type, params.locationId ?? 'all', params.limit ?? 5],
    queryFn: async () =>
      dashboardReportRepo.getTopCustomers({
        period: params.period,
        referenceDate: params.referenceDate,
        type: params.type,
        locationId: params.locationId ?? undefined,
        limit: params.limit,
      }),
  })

export const getTopCategoriesQueryOptions = (params: {
  period: AdvancedPeriod
  referenceDate: string
  type: TopCategoryType
  locationId?: string | null
}) =>
  queryOptions({
    queryKey: ['dashboard-report', 'top-categories', params.period, params.referenceDate, params.type, params.locationId ?? 'all'],
    queryFn: async () =>
      dashboardReportRepo.getTopCategories({
        period: params.period,
        referenceDate: params.referenceDate,
        type: params.type,
        locationId: params.locationId ?? undefined,
      }),
  })

export const getCategoriesByInventoriesQueryOptions = (params: {
  locationId?: string | null
}) =>
  queryOptions({
    queryKey: ['dashboard-report', 'categories-by-inventories', params.locationId ?? 'all'],
    queryFn: async () =>
      dashboardReportRepo.getCategoriesByInventories({
        locationId: params.locationId ?? undefined,
      }),
  })

export const getTopStaleBatchesQueryOptions = (params: {
  tenantId: string
  locationId?: string | null
  limit?: number
}) =>
  queryOptions({
    queryKey: [
      'dashboard-report',
      'top-stale-batches',
      params.tenantId,
      params.locationId ?? 'all',
      params.limit ?? 8,
    ],
    queryFn: async () => {
      if (!params.tenantId) return []
      return dashboardReportRepo.getTopStaleBatches({
        tenantId: params.tenantId,
        locationId: params.locationId ?? undefined,
        limit: params.limit,
      })
    },
  })

export const getSalesTimeSeriesQueryOptions = (params: {
  period: AdvancedPeriod
  referenceDate: string
  groupBy: SalesTimeSeriesGroupBy
  type: SalesTimeSeriesType
  locationId?: string | null
}) =>
  queryOptions({
    queryKey: ['dashboard-report', 'sales-time-series', params.period, params.referenceDate, params.groupBy, params.type, params.locationId ?? 'all'],
    queryFn: async () =>
      dashboardReportRepo.getSalesTimeSeries({
        period: params.period,
        referenceDate: params.referenceDate,
        groupBy: params.groupBy,
        type: params.type,
        locationId: params.locationId ?? undefined,
      }),
  })

export const getSalesStatisticsQueryOptions = (params: {
  period: SalesPeriod
  locationId?: string | null
}) =>
  queryOptions({
    queryKey: ['dashboard-report', 'sales-statistics', params.period, params.locationId ?? 'all'],
    queryFn: async () =>
      dashboardReportRepo.getSalesStatistics({
        period: params.period,
        locationId: params.locationId ?? undefined,
      }),
  })

export const getTopProductsQueryOptions = (params: {
  period: SalesPeriod
  type: TopProductType
  locationId?: string | null
  limit?: number
}) =>
  queryOptions({
    queryKey: ['dashboard-report', 'top-products', params.period, params.type, params.locationId ?? 'all', params.limit ?? 5],
    queryFn: async () =>
      dashboardReportRepo.getTopProducts({
        period: params.period,
        type: params.type,
        locationId: params.locationId ?? undefined,
        limit: params.limit,
      }),
  })

export const getPurchasesStatisticsV2QueryOptions = (params: {
  locationId?: string | null
  supplierId?: string
  purchasePeriodId?: number
}) =>
  queryOptions({
    queryKey: ['dashboard-report', 'purchases-statistics-v2', params.locationId ?? 'all', params.supplierId ?? 'supplier-all', params.purchasePeriodId ?? 0],
    queryFn: async () =>
      dashboardReportRepo.getPurchasesStatisticsV2({
        locationId: params.locationId ?? undefined,
        supplierId: params.supplierId ?? undefined,
        purchasePeriodId: params.purchasePeriodId ?? undefined,
      }),
  })

export const getTopSuppliersQueryOptions = (params: {
  locationId?: string | null
  type: TopSupplierType
  purchasePeriodId?: number
}) =>
  queryOptions({
    queryKey: ['dashboard-report', 'top-suppliers', params.type, params.locationId ?? 'all', params.purchasePeriodId ?? 0],
    queryFn: async () =>
      dashboardReportRepo.getTopSuppliers({
        locationId: params.locationId ?? undefined,
        type: params.type,
        purchasePeriodId: params.purchasePeriodId,
      }),
  })

export const getTopPurchasedProductsQueryOptions = (params: {
  locationId?: string | null
  type: TopPurchasedProductType
  purchasePeriodId?: number
}) =>
  queryOptions({
    queryKey: ['dashboard-report', 'top-purchased-products', params.type, params.locationId ?? 'all', params.purchasePeriodId ?? 0],
    queryFn: async () =>
      dashboardReportRepo.getTopPurchasedProducts({
        locationId: params.locationId ?? undefined,
        type: params.type,
        purchasePeriodId: params.purchasePeriodId,
      }),
  })

export const getLowStockProductsQueryOptions = (params: {
  locationId?: string | null
}) =>
  queryOptions({
    queryKey: ['dashboard-report', 'low-stock-products', params.locationId ?? 'all'],
    queryFn: async () =>
      dashboardReportRepo.getLowStockProducts({
        locationId: params.locationId ?? undefined,
      }),
  })

export const getDeadValueInventoryQueryOptions = (params: {
  locationId?: string | null
  days?: number
}) =>
  queryOptions({
    queryKey: ['dashboard-report', 'dead-value-inventory', params.locationId ?? 'all', params.days ?? 0],
    queryFn: async () =>
      dashboardReportRepo.getDeadValueInventory({
        locationId: params.locationId ?? undefined,
        days: params.days,
      }),
  })

export const getPotentialLossInventoryQueryOptions = (params: {
  locationId?: string | null
  days?: number
}) =>
  queryOptions({
    queryKey: ['dashboard-report', 'potential-loss-inventory', params.locationId ?? 'all', params.days ?? 0],
    queryFn: async () =>
      dashboardReportRepo.getPotentialLossInventory({
        locationId: params.locationId ?? undefined,
        days: params.days,
      }),
  })

export const getLowStockInventoryQueryOptions = (params: {
  locationId?: string | null
  days?: number
}) =>
  queryOptions({
    queryKey: ['dashboard-report', 'low-stock-inventory', params.locationId ?? 'all', params.days ?? 0],
    queryFn: async () =>
      dashboardReportRepo.getLowStockInventory({
        locationId: params.locationId ?? undefined,
        days: params.days,
      }),
  })

export const getSuggestQuickPurchaseOrdersQueryOptions = (params: {
  locationId?: string | null
  reorderDays?: number
  targetDays?: number
  type?: number
}) =>
  queryOptions({
    queryKey: ['dashboard-report', 'suggest-quick-purchase-orders', params.locationId ?? 'all', params.reorderDays ?? 0, params.targetDays ?? 0, params.type ?? 0],
    queryFn: async () =>
      dashboardReportRepo.suggestQuickPurchaseOrders({
        locationId: params.locationId ?? undefined,
        reorderDays: params.reorderDays,
        targetDays: params.targetDays,
        type: params.type,
      }),
  })

export const getInventoryValueByMonthQueryOptions = (params: {
  locationId?: string | null
  categoryId?: string | null
  fromDate?: string
  toDate?: string
}) =>
  queryOptions({
    queryKey: ['dashboard-report', 'inventory-value-by-month', params.locationId ?? 'all', params.categoryId ?? 'all', params.fromDate ?? '', params.toDate ?? ''],
    queryFn: async () =>
      dashboardReportRepo.getInventoryValueByMonth({
        locationId: params.locationId ?? undefined,
        categoryId: params.categoryId ?? undefined,
        fromDate: params.fromDate,
        toDate: params.toDate,
      }),
  })

export const getExpiredInventoryBatchesQueryOptions = (params: {
  tenantId: string
  locationId?: string | null
  limit?: number
}) =>
  queryOptions({
    queryKey: [
      'dashboard-report',
      'expired-batches',
      params.tenantId,
      params.locationId ?? 'all',
      params.limit ?? 0,
    ],
    queryFn: async () => {
      if (!params.tenantId) {
        return []
      }
      return dashboardReportRepo.getExpiredInventoryBatches({
        tenantId: params.tenantId,
        locationId: params.locationId ?? undefined,
        limit: params.limit,
      })
    },
  })
