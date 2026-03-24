import { queryOptions } from "@tanstack/react-query"
import {
  profilesRepo,
  tenantsRepo,
  locationsRepo,
  categoriesRepo,
  suppliersRepo,
  supplierBankAccountsRepo,
  supplierPaymentsRepo,
  customersRepo,
  productsRepo,
  purchaseOrdersRepo,
  inventoryBatchesRepo,
  saleOrdersRepo,
  bankAccountsRepo,
  stockAdjustmentsRepo,
  dashboardReportRepo,
  activityHistoryRepo,
  purchasePeriodsRepo,
} from '.'
import { type PurchaseOrdersHistoryQueryInput } from '@/services/supabase/database/repo/purchaseOrdersRepo'
import { type SupplierPaymentsHistoryQueryInput, type AllSupplierPaymentsHistoryQueryInput } from '@/services/supabase/database/repo/supplierPaymentsRepo'
import { type SaleOrdersHistoryQueryInput } from '@/services/supabase/database/repo/saleOrdersRepo'
import {
  type InventoryBatchesListQueryInput,
  type InventoryBatchesSummaryQueryInput,
  type InventoryProductsListQueryInput,
} from '@/services/supabase/database/repo/inventoryBatchesRepo'
import {
  type StockAdjustmentsListQueryInput,
} from '@/services/supabase/database/repo/stockAdjustmentsRepo'
import {
  type ActivityHistoryQueryInput,
} from '@/services/supabase/database/repo/activityHistoryRepo'
import {
  productMastersRepo,
} from '.'
import { type SalesPeriod, type TopProductType, type TopSupplierType, type TopPurchasedProductType } from '@/services/supabase/database/repo/dashboardReportRepo'


export type VietQrBank = {
  id: number | string
  name: string
  code: string
  bin: string
  shortName?: string
  logo?: string
}

export const getProfilesQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: ["profiles", userId],
    queryFn: async () => {
      const profiles = await profilesRepo.getProfileByUserId(userId)
      return profiles
    },
    staleTime: 10 * 60 * 1000, // 10 min — rarely changes, critical for app bootstrap
  })

export const getStaffUsersQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ['staff-users', tenantId],
    queryFn: async () => {
      const profiles = await profilesRepo.getProfilesByTenantId(tenantId)
      return profiles
    },
  })

export const getTenantQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ["tenants", tenantId],
    queryFn: async () => {
      const tenant = await tenantsRepo.getTenantById(tenantId)
      return tenant
    },
  })

export const getLocationsQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ["locations", tenantId],
    queryFn: async () => {
      const locations = await locationsRepo.getLocationsByTenantId(tenantId)
      return locations
    },
    staleTime: 5 * 60 * 1000, // 5 min — stable data, critical for offline sale-order
  })

export const getLocationQueryOptions = (locationId: string) =>
  queryOptions({
    queryKey: ["locations", locationId],
    queryFn: async () => {
      const location = await locationsRepo.getLocationById(locationId)
      return location
    },
  })

export const getCategoriesQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ["categories", tenantId],
    queryFn: async () => {
      const categories = await categoriesRepo.getCategories(tenantId)
      return categories
    },
  })

export const getCategoriesWithActiveProductsCountQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ["categories", tenantId, "withActiveProductsCount"],
    queryFn: async () => {
      const categories = await categoriesRepo.getCategoriesWithActiveProductsCount(tenantId)
      return categories
    },
  })

export const getSuppliersQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ["suppliers", tenantId],
    queryFn: async () => {
      const suppliers = await suppliersRepo.getAllSuppliersByTenantId(tenantId)
      return suppliers
    },
  })

export const getBankAccountsQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ['bank-accounts', tenantId],
    queryFn: () => bankAccountsRepo.getBankAccountsByTenantId(tenantId),
    staleTime: 5 * 60 * 1000, // 5 min — stable data, critical for offline sale-order
  })

export const getSupplierBankAccountsQueryOptions = (supplierId: string) =>
  queryOptions({
    queryKey: ['supplier-bank-accounts', supplierId],
    queryFn: () =>
      supplierBankAccountsRepo.getSupplierBankAccountsBySupplierId(supplierId),
  })

export const getSupplierDetailQueryOptions = (
  tenantId: string,
  supplierId: string
) =>
  queryOptions({
    queryKey: ["suppliers", tenantId, "detail", supplierId],
    queryFn: async () => {
      if (!tenantId || !supplierId) {
        return null
      }
      const supplier = await suppliersRepo.getSupplierById({
        tenantId,
        supplierId,
      })
      return supplier
    },
  })

export const getCustomersQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ["customers", tenantId],
    queryFn: async () => {
      const customers = await customersRepo.getAllCustomersByTenantId(tenantId)
      return customers
    },
    staleTime: 5 * 60 * 1000, // 5 min — critical for offline sale-order
  })

export const getCustomerDetailQueryOptions = (
  tenantId: string,
  customerId: string
) =>
  queryOptions({
    queryKey: ["customers", tenantId, "detail", customerId],
    queryFn: async () => {
      if (!tenantId || !customerId) {
        return null
      }
      const customer = await customersRepo.getCustomerById({
        tenantId,
        customerId,
      })
      return customer
    },
  })

export const getProductsQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ["products", tenantId],
    queryFn: async () => {
      const products = await productsRepo.getAllProductsByTenantId(tenantId)
      return products
    },
    staleTime: 5 * 60 * 1000, // 5 min — critical for offline sale-order
  })

export const getPurchaseOrdersHistoryQueryOptions = (
  params: PurchaseOrdersHistoryQueryInput
) =>
  queryOptions({
    queryKey: [
      "purchase-orders",
      params.tenantId,
      "history",
      {
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        search: params.search ?? '',
        supplierId: params.supplierId ?? '',
        locationId: params.locationId ?? '',
        statuses: params.statuses ?? [],
        paymentStatuses: params.paymentStatuses ?? [],
        fromDate: params.fromDate ?? '',
        toDate: params.toDate ?? '',
        purchasePeriodId: params.purchasePeriodId ?? 0,
        sorting: params.sorting ?? [],
      },
    ],
    queryFn: async () => {
      const result = await purchaseOrdersRepo.getPurchaseOrdersHistory(params)
      return result
    },
  })

export const getPurchasePeriodsQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ["purchase-periods", tenantId],
    queryFn: async () => {
      const periods = await purchasePeriodsRepo.getPurchasePeriodsByTenantId(tenantId)
      return periods
    },
    staleTime: 5 * 60 * 1000,
  })

export const getPurchaseOrdersBySupplierIdQueryOptions = (
  tenantId: string,
  supplierId: string
) =>
  queryOptions({
    queryKey: ["purchase-orders", tenantId, "supplier", supplierId],
    queryFn: async () => {
      if (!tenantId || !supplierId) {
        return []
      }
      const orders = await purchaseOrdersRepo.getPurchaseOrdersBySupplierId({
        tenantId,
        supplierId,
      })
      return orders
    },
  })

export const getPurchaseOrderDetailQueryOptions = (
  tenantId: string,
  orderCode: string
) =>
  queryOptions({
    queryKey: ["purchase-orders", tenantId, "detail", orderCode],
    queryFn: async () => {
      if (!tenantId || !orderCode) {
        return null
      }
      const order = await purchaseOrdersRepo.getPurchaseOrderByCodeWithItems({
        tenantId,
        orderCode,
      })
      return order
    },
  })

export const getPurchaseOrderDetailWithRelationsQueryOptions = (
  tenantId: string,
  orderCode: string
) =>
  queryOptions({
    queryKey: ["purchase-orders", tenantId, "detail-with-relations", orderCode],
    queryFn: async () => {
      if (!tenantId || !orderCode) {
        return null
      }
      const order = await purchaseOrdersRepo.getPurchaseOrderByCodeWithRelations({
        tenantId,
        orderCode,
      })
      return order
    },
  })

export const getSaleOrderDetailQueryOptions = (
  tenantId: string,
  orderCode: string
) =>
  queryOptions({
    queryKey: ["sale-orders", tenantId, "detail", orderCode],
    queryFn: async () => {
      if (!tenantId || !orderCode) {
        return null
      }
      const order = await saleOrdersRepo.getSaleOrderByCodeWithItems({
        tenantId,
        orderCode,
      })
      return order
    },
  })

export const getSaleOrderDetailWithRelationsQueryOptions = (
  tenantId: string,
  orderCode: string
) =>
  queryOptions({
    queryKey: ["sale-orders", tenantId, "detail-with-relations", orderCode],
    queryFn: async () => {
      if (!tenantId || !orderCode) {
        return null
      }
      const order = await saleOrdersRepo.getSaleOrderByCodeWithRelations({
        tenantId,
        orderCode,
      })
      return order
    },
  })

export const getSaleOrdersByCustomerIdQueryOptions = (
  tenantId: string,
  customerId: string
) =>
  queryOptions({
    queryKey: ["sale-orders", tenantId, "customer", customerId],
    queryFn: async () => {
      if (!tenantId || !customerId) {
        return []
      }
      const orders = await saleOrdersRepo.getSaleOrdersByCustomerId({
        tenantId,
        customerId,
      })
      return orders
    },
  })

export const getSaleOrdersHistoryQueryOptions = (
  params: SaleOrdersHistoryQueryInput
) =>
  queryOptions({
    queryKey: [
      'sale-orders',
      params.tenantId,
      'history',
      {
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        search: params.search ?? '',
        customerId: params.customerId ?? '',
        locationId: params.locationId ?? '',
        statuses: params.statuses ?? [],
        fromDate: params.fromDate ?? '',
        toDate: params.toDate ?? '',
        sorting: params.sorting ?? [],
      },
    ],
    queryFn: async () => {
      const result = await saleOrdersRepo.getSaleOrdersHistory(params)
      return result
    },
  })

export const getVietQrBanksQueryOptions = () =>
  queryOptions({
    queryKey: ['vietqr-banks'],
    queryFn: async () => {
      const response = await fetch('https://api.vietqr.io/v2/banks')
      if (!response.ok) {
        throw new Error('Không thể tải danh sách ngân hàng.')
      }
      const payload = (await response.json()) as { data?: VietQrBank[] }
      return payload?.data ?? []
    },
    staleTime: 24 * 60 * 60 * 1000,
  })

export const getSupplierPaymentsBySupplierIdQueryOptions = (
  tenantId: string,
  supplierId: string
) =>
  queryOptions({
    queryKey: ["supplier-payments", tenantId, supplierId],
    queryFn: async () => {
      if (!tenantId || !supplierId) {
        return []
      }
      const payments = await supplierPaymentsRepo.getSupplierPaymentsBySupplierId({
        tenantId,
        supplierId,
      })
      return payments
    },
  })

export const getSupplierPaymentsHistoryQueryOptions = (
  params: SupplierPaymentsHistoryQueryInput
) =>
  queryOptions({
    queryKey: [
      'supplier-payments',
      params.tenantId,
      params.supplierId,
      'history',
      {
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        search: params.search ?? '',
        fromDate: params.fromDate ?? '',
        toDate: params.toDate ?? '',
        purchasePeriodId: params.purchasePeriodId ?? 0,
        sorting: params.sorting ?? [],
      },
    ],
    queryFn: async () => {
      if (!params.tenantId || !params.supplierId) {
        return { data: [], total: 0 }
      }
      const result = await supplierPaymentsRepo.getSupplierPaymentsHistory(params)
      return result
    },
  })

export const getAllSupplierPaymentsHistoryQueryOptions = (
  params: AllSupplierPaymentsHistoryQueryInput
) =>
  queryOptions({
    queryKey: [
      'supplier-payments',
      'all-history',
      params.tenantId,
      {
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        search: params.search ?? '',
        supplierIds: params.supplierIds ?? [],
        fromDate: params.fromDate ?? '',
        toDate: params.toDate ?? '',
        sorting: params.sorting ?? [],
        purchasePeriodId: params.purchasePeriodId ?? 0,
      },
    ],
    queryFn: async () => {
      if (!params.tenantId) {
        return { data: [], total: 0 }
      }
      const result = await supplierPaymentsRepo.getAllSupplierPaymentsHistory(params)
      return result
    },
  })

export const getAllAvailableInventoryBatchesQueryOptions = (
  tenantId: string,
) =>
  queryOptions({
    queryKey: ["inventory-batches", tenantId, 'all', 'all-available'],
    queryFn: async () => {
      if (!tenantId) {
        return []
      }
      const batches = await inventoryBatchesRepo.getAllAvailableBatches({
        tenantId,
      })
      return batches
    },
    staleTime: 1 * 60 * 1000, // 1 min — critical for offline sale-order
  })

export const getInventoryBatchesQueryOptions = (
  tenantId: string,
  productIds: string[],
  locationId?: string | null
) =>
  queryOptions({
    queryKey: ["inventory-batches", tenantId, locationId ?? 'all', productIds],
    queryFn: async () => {
      if (!tenantId || productIds.length === 0) {
        return []
      }
      const batches = await inventoryBatchesRepo.getInventoryBatchesByProductIds({
        tenantId,
        productIds,
        locationId,
      })
      return batches
    },
  })

export const getInventoryBatchesListQueryOptions = (
  params: InventoryBatchesListQueryInput
) =>
  queryOptions({
    queryKey: [
      'inventory-batches',
      params.tenantId,
      'list',
      {
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        search: params.search ?? '',
        locationId: params.locationId ?? '',
        stockStatus: params.stockStatus ?? '',
        expiryStatus: params.expiryStatus ?? '',
        sortBy: params.sortBy ?? '',
        sortOrder: params.sortOrder ?? '',
      },
    ],
    queryFn: async () => {
      const result = await inventoryBatchesRepo.getInventoryBatchesList(params)
      return result
    },
  })

export const getInventoryProductsListQueryOptions = (
  params: InventoryProductsListQueryInput
) =>
  queryOptions({
    queryKey: [
      'inventory-products',
      params.tenantId,
      'list',
      {
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        search: params.search ?? '',
        locationId: params.locationId ?? '',
        stockStatus: params.stockStatus ?? '',
        expiryStatus: params.expiryStatus ?? '',
        sortBy: params.sortBy ?? '',
        sortOrder: params.sortOrder ?? '',
      },
    ],
    queryFn: async () => {
      const result = await inventoryBatchesRepo.getInventoryProductsList(params)
      return result
    },
  })

export const getInventoryBatchesSummaryQueryOptions = (
  params: InventoryBatchesSummaryQueryInput
) =>
  queryOptions({
    queryKey: [
      'inventory-batches',
      params.tenantId,
      'summary',
      {
        search: params.search ?? '',
        locationId: params.locationId ?? '',
      },
    ],
    queryFn: async () => {
      if (!params.tenantId) {
        return { totalBatches: 0, totalProducts: 0, totalQuantity: 0, totalValue: 0 }
      }
      const result = await inventoryBatchesRepo.getInventoryBatchesSummary(params)
      return result
    },
  })

export const getStockAdjustmentsListQueryOptions = (
  params: StockAdjustmentsListQueryInput
) =>
  queryOptions({
    queryKey: [
      'stock-adjustments',
      params.tenantId,
      'list',
      {
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        search: params.search ?? '',
        locationId: params.locationId ?? '',
        reasonCodes: params.reasonCodes ?? [],
        adjustmentTypes: params.adjustmentTypes ?? [],
        fromDate: params.fromDate ?? '',
        toDate: params.toDate ?? '',
      },
    ],
    queryFn: async () => {
      if (!params.tenantId) {
        return { data: [], total: 0 }
      }
      const result = await stockAdjustmentsRepo.getStockAdjustmentsList(params)
      return result
    },
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

export const getActivityHistoryQueryOptions = (
  params: ActivityHistoryQueryInput
) =>
  queryOptions({
    queryKey: [
      'activity-history',
      params.tenantId,
      params.userId ?? 'all',
      {
        locationId: params.locationId ?? 'all',
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        fromDate: params.fromDate ?? null,
        toDate: params.toDate ?? null,
      },
    ],
    queryFn: async () => {
      if (!params.tenantId) {
        return { data: [], total: 0 }
      }
      return activityHistoryRepo.getActivityHistory(params)
    },
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

export type ProductMastersBySourceQueryInput = {
  source: string
  search?: string
  pageIndex: number
  pageSize: number
}

export const getProductMastersBySourceQueryOptions = (
  params: ProductMastersBySourceQueryInput
) =>
  queryOptions({
    queryKey: [
      'product-masters',
      params.source,
      {
        search: params.search ?? '',
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
      },
    ],
    queryFn: async () => {
      const result = await productMastersRepo.getBySource(params)
      return result
    },
  })

