import { BasePharmacySupabaseClient } from '../../client'
import type { Tables, TablesInsert, TablesUpdate } from '../../database.types'

export type SupplierPayment = Tables<'supplier_payments'>
export type SupplierPaymentInsert = TablesInsert<'supplier_payments'>
export type SupplierPaymentUpdate = TablesUpdate<'supplier_payments'>

export type SupplierPaymentsHistoryQueryInput = {
  tenantId: string
  supplierId: string
  pageIndex: number
  pageSize: number
  search?: string
  fromDate?: string
  toDate?: string
  purchasePeriodId?: number
  sorting?: Array<{ id: string; desc: boolean }>
}

export type SupplierPaymentsHistoryQueryResult = {
  data: SupplierPaymentWithSupplier[]
  total: number
}

export type SupplierPaymentWithSupplier = SupplierPayment & {
  supplier: { id: string; name: string } | null
}

export type AllSupplierPaymentsHistoryQueryInput = {
  tenantId: string
  pageIndex: number
  pageSize: number
  search?: string
  supplierIds?: string[]
  fromDate?: string
  toDate?: string
  purchasePeriodId?: number
  sorting?: Array<{ id: string; desc: boolean }>
}

export type AllSupplierPaymentsHistoryQueryResult = {
  data: SupplierPaymentWithSupplier[]
  total: number
}

export const createSupplierPaymentRepository = (
  client: BasePharmacySupabaseClient
) => {
  return {
    async createSupplierPayment(
      payload: SupplierPaymentInsert
    ): Promise<SupplierPayment> {
      const { data, error } = await client
        .from('supplier_payments')
        .insert(payload)
        .select('*')
        .single()

      if (error) {
        throw error
      }

      return data as SupplierPayment
    },
    async getSupplierPaymentsBySupplierId(params: {
      tenantId: string
      supplierId: string
    }): Promise<SupplierPayment[]> {
      const { data, error } = await client
        .from('supplier_payments')
        .select('*')
        .eq('tenant_id', params.tenantId)
        .eq('supplier_id', params.supplierId)
        .order('created_at', { ascending: false })
        .order('payment_date', { ascending: false })

      if (error) {
        throw error
      }

      return (data ?? []) as SupplierPayment[]
    },
    async deleteSupplierPayment(paymentId: string): Promise<void> {
      const { error } = await client
        .from('supplier_payments')
        .delete()
        .eq('id', paymentId)

      if (error) {
        throw error
      }
    },
    async getSupplierPaymentsHistory(
      params: SupplierPaymentsHistoryQueryInput
    ): Promise<SupplierPaymentsHistoryQueryResult> {
      const start = params.pageIndex * params.pageSize
      const end = start + params.pageSize - 1
      const searchValue = params.search?.trim()

      const selectBase = '*, supplier:suppliers!supplier_payments_supplier_id_fkey(id, name)'
      const selectWithPeriod = `${selectBase}, purchase_order:purchase_orders!supplier_payments_purchase_order_id_fkey!inner(id)`

      let query = client
        .from('supplier_payments')
        .select(params.purchasePeriodId ? selectWithPeriod : selectBase, { count: 'exact' })
        .eq('tenant_id', params.tenantId)
        .eq('supplier_id', params.supplierId)

      if (params.purchasePeriodId) {
        query = query.eq('purchase_order.purchase_period_id', params.purchasePeriodId)
      }

      if (searchValue) {
        query = query.or(`reference_code.ilike.%${searchValue}%,note.ilike.%${searchValue}%`)
      }

      if (params.fromDate) {
        query = query.gte('payment_date', params.fromDate)
      }

      if (params.toDate) {
        query = query.lte('payment_date', params.toDate)
      }

      const sort = params.sorting?.[0]
      const sortColumnMap: Record<string, string> = {
        payment_date: 'payment_date',
        amount: 'amount',
        created_at: 'created_at',
        reference_code: 'reference_code',
      }
      const sortColumn = sort ? sortColumnMap[sort.id] : undefined

      if (sortColumn) {
        query = query.order(sortColumn, { ascending: !sort?.desc })
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error, count } = await query.range(start, end)

      if (error) {
        throw error
      }

      return {
        data: (data ?? []) as SupplierPaymentWithSupplier[],
        total: count ?? 0,
      }
    },
    async getAllSupplierPaymentsHistory(
      params: AllSupplierPaymentsHistoryQueryInput
    ): Promise<AllSupplierPaymentsHistoryQueryResult> {
      const start = params.pageIndex * params.pageSize
      const end = start + params.pageSize - 1
      const searchValue = params.search?.trim()

      const selectBase = '*, supplier:suppliers!supplier_payments_supplier_id_fkey(id, name)'
      const selectWithPeriod = `${selectBase}, purchase_order:purchase_orders!supplier_payments_purchase_order_id_fkey!inner(id)`

      let query = client
        .from('supplier_payments')
        .select(params.purchasePeriodId ? selectWithPeriod : selectBase, { count: 'exact' })
        .eq('tenant_id', params.tenantId)

      if (params.purchasePeriodId) {
        query = query.eq('purchase_order.purchase_period_id', params.purchasePeriodId)
      }

      if (params.supplierIds && params.supplierIds.length > 0) {
        query = query.in('supplier_id', params.supplierIds)
      }

      if (searchValue) {
        query = query.or(`reference_code.ilike.%${searchValue}%,note.ilike.%${searchValue}%`)
      }

      if (params.fromDate) {
        query = query.gte('payment_date', params.fromDate)
      }

      if (params.toDate) {
        query = query.lte('payment_date', params.toDate)
      }

      const sort = params.sorting?.[0]
      const sortColumnMap: Record<string, string> = {
        payment_date: 'payment_date',
        amount: 'amount',
        created_at: 'created_at',
        reference_code: 'reference_code',
      }
      const sortColumn = sort ? sortColumnMap[sort.id] : undefined

      if (sortColumn) {
        query = query.order(sortColumn, { ascending: !sort?.desc })
      } else {
        query = query.order('payment_date', { ascending: false })
      }

      const { data, error, count } = await query.range(start, end)

      if (error) {
        throw error
      }

      return {
        data: (data ?? []) as SupplierPaymentWithSupplier[],
        total: count ?? 0,
      }
    },
  }
}
