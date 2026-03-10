import { BasePharmacySupabaseClient } from '../../client'
import type { Tables, TablesInsert, TablesUpdate } from '../../database.types'

export type BankAccount = Tables<'bank_accounts'>
export type BankAccountInsert = TablesInsert<'bank_accounts'>
export type BankAccountUpdate = TablesUpdate<'bank_accounts'>

export const createBankAccountRepository = (
  client: BasePharmacySupabaseClient
) => ({
  async getBankAccountsByTenantId(
    tenantId: string
  ): Promise<BankAccount[]> {
    const { data, error } = await client
      .from('bank_accounts')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    return (data ?? []) as BankAccount[]
  },

  async createBankAccount(
    params: BankAccountInsert
  ): Promise<BankAccount> {
    const { data, error } = await client
      .from('bank_accounts')
      .insert(params)
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return data as BankAccount
  },

  async updateBankAccount(
    id: string,
    params: BankAccountUpdate
  ): Promise<BankAccount> {
    const { data, error } = await client
      .from('bank_accounts')
      .update(params)
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      throw error
    }

    return data as BankAccount
  },
  // Các tài khoản khác của cùng tenant sẽ tự động bị set is_default = false ở xử lý bên server
  async setDefaultBankAccount(id: string): Promise<void> {
    const { error } = await client
      .from('bank_accounts')
      .update({ is_default: true })
      .eq('id', id)
    if (error) throw error
  },

  async deleteBankAccount(id: string): Promise<void> {
    const { error } = await client
      .from('bank_accounts')
      .delete()
      .eq('id', id)

    if (error) {
      throw error
    }
  },
})
