import { queryOptions } from "@tanstack/react-query"
import { supplierPaymentsRepo } from '..'
import type {
  SupplierPaymentsHistoryQueryInput,
  AllSupplierPaymentsHistoryQueryInput,
} from '@/services/supabase/database/model'

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
