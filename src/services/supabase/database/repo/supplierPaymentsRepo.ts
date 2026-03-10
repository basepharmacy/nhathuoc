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
  sorting?: Array<{ id: string; desc: boolean }>
}

export type SupplierPaymentsHistoryQueryResult = {
  data: SupplierPayment[]
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

      let query = client
        .from('supplier_payments')
        .select('*', { count: 'exact' })
        .eq('tenant_id', params.tenantId)
        .eq('supplier_id', params.supplierId)

      if (searchValue) {
        query = query.ilike('note', `%${searchValue}%`)
      }

      const sort = params.sorting?.[0]
      const sortColumnMap: Record<string, string> = {
        payment_date: 'payment_date',
        amount: 'amount',
        created_at: 'created_at',
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
        data: (data ?? []) as SupplierPayment[],
        total: count ?? 0,
      }
    },
  }
}
