import { BasePharmacySupabaseClient } from '../../client'
import { SupplierBankAccount, SupplierBankAccountInsert } from '../model'

export const createSupplierBankAccountRepository = (
  client: BasePharmacySupabaseClient
) => ({
  async getSupplierBankAccountsBySupplierId(
    supplierId: string
  ): Promise<SupplierBankAccount[]> {
    const { data, error } = await client
      .from('supplier_bank_accounts')
      .select('*')
      .eq('supplier_id', supplierId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    return (data ?? []) as SupplierBankAccount[]
  },
  async replaceSupplierBankAccounts(params: {
    supplierId: string
    tenantId: string
    accounts: Array<
      Omit<SupplierBankAccountInsert, 'supplier_id' | 'tenant_id'>
    >
  }): Promise<SupplierBankAccount[]> {
    const { error: deleteError } = await client
      .from('supplier_bank_accounts')
      .delete()
      .eq('supplier_id', params.supplierId)
      .eq('tenant_id', params.tenantId)

    if (deleteError) {
      throw deleteError
    }

    if (!params.accounts.length) {
      return []
    }

    const payload = params.accounts.map((account) => ({
      ...account,
      supplier_id: params.supplierId,
      tenant_id: params.tenantId,
    }))

    const { data, error } = await client
      .from('supplier_bank_accounts')
      .insert(payload)
      .select('*')

    if (error) {
      throw error
    }

    return (data ?? []) as SupplierBankAccount[]
  },
})
