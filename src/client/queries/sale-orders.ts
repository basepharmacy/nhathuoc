import { queryOptions } from "@tanstack/react-query"
import { saleOrdersRepo } from '..'
import type { SaleOrdersHistoryQueryInput } from '@/services/supabase/database/model'

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
