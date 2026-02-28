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
} from '.'
import { type PurchaseOrdersHistoryQueryInput } from '@/services/supabase/database/repo/purchaseOrdersRepo'

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