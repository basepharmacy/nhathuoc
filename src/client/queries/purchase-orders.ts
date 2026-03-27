import { queryOptions } from "@tanstack/react-query"
import { purchaseOrdersRepo } from '..'
import type { PurchaseOrdersHistoryQueryInput } from '@/services/supabase/database/model'

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
