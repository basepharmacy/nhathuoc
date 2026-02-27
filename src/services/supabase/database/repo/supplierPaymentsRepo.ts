import { BasePharmacySupabaseClient } from '../../client'
import type { Tables, TablesInsert, TablesUpdate } from '../../database.types'

export type SupplierPayment = Tables<'supplier_payments'>
export type SupplierPaymentInsert = TablesInsert<'supplier_payments'>
export type SupplierPaymentUpdate = TablesUpdate<'supplier_payments'>

export const createSupplierPaymentRepository = (
  client: BasePharmacySupabaseClient
) => {
  return {
    async getSupplierPaymentsBySupplierId(params: {
      tenantId: string
      supplierId: string
    }): Promise<SupplierPayment[]> {
      const { data, error } = await client
        .from('supplier_payments')
        .select('*')
        .eq('tenant_id', params.tenantId)
        .eq('supplier_id', params.supplierId)
        .order('payment_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return (data ?? []) as SupplierPayment[]
    },
  }
}
