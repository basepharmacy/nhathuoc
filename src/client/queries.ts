import { queryOptions } from "@tanstack/react-query"
import {
  profilesRepo,
  tenantsRepo,
  locationsRepo,
  categoriesRepo,
  suppliersRepo,
  supplierPaymentsRepo,
  customersRepo,
  productsRepo,
  purchaseOrdersRepo,
  inventoryBatchesRepo,
  saleOrdersRepo,
} from '.'
import { type PurchaseOrdersHistoryQueryInput } from '@/services/supabase/database/repo/purchaseOrdersRepo'
import { type SupplierPaymentsHistoryQueryInput } from '@/services/supabase/database/repo/supplierPaymentsRepo'
import { type SaleOrdersHistoryQueryInput } from '@/services/supabase/database/repo/saleOrdersRepo'
import {
  type InventoryBatchesListQueryInput,
  type InventoryBatchesSummaryQueryInput,
} from '@/services/supabase/database/repo/inventoryBatchesRepo'

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
      const categories = await categoriesRepo.getAllCategoriesByTenantId(tenantId)
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
  })

export const getPurchaseOrdersQueryOptions = (tenantId: string) =>
  queryOptions({
    queryKey: ["purchase-orders", tenantId],
    queryFn: async () => {
      const orders = await purchaseOrdersRepo.getPurchaseOrdersByTenantId(tenantId)
      return orders
    },
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
        supplierIds: params.supplierIds ?? [],
        statuses: params.statuses ?? [],
        paymentStatuses: params.paymentStatuses ?? [],
        sorting: params.sorting ?? [],
      },
    ],
    queryFn: async () => {
      const result = await purchaseOrdersRepo.getPurchaseOrdersHistory(params)
      return result
    },
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
  orderId: string
) =>
  queryOptions({
    queryKey: ["purchase-orders", tenantId, "detail", orderId],
    queryFn: async () => {
      if (!tenantId || !orderId) {
        return null
      }
      const order = await purchaseOrdersRepo.getPurchaseOrderByIdWithItems({
        tenantId,
        orderId,
      })
      return order
    },
  })

export const getSaleOrderDetailQueryOptions = (
  tenantId: string,
  orderId: string
) =>
  queryOptions({
    queryKey: ["sale-orders", tenantId, "detail", orderId],
    queryFn: async () => {
      if (!tenantId || !orderId) {
        return null
      }
      const order = await saleOrdersRepo.getSaleOrderByIdWithItems({
        tenantId,
        orderId,
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
        customerIds: params.customerIds ?? [],
        statuses: params.statuses ?? [],
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
        locationIds: params.locationIds ?? [],
      },
    ],
    queryFn: async () => {
      if (!params.tenantId) {
        return { data: [], total: 0 }
      }
      const result = await inventoryBatchesRepo.getInventoryBatchesList(params)
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
        locationIds: params.locationIds ?? [],
      },
    ],
    queryFn: async () => {
      if (!params.tenantId) {
        return { totalProducts: 0, totalQuantity: 0, totalValue: 0 }
      }
      const result = await inventoryBatchesRepo.getInventoryBatchesSummary(params)
      return result
    },
  })