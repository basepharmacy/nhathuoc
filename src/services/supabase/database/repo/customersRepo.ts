import { BasePharmacySupabaseClient } from '../../client'
import type { Tables, TablesInsert, TablesUpdate } from '../../database.types'

export type Customer = Tables<'customers'>
export type CustomerInsert = TablesInsert<'customers'>
export type CustomerUpdate = TablesUpdate<'customers'>

export const createCustomerRepository = (client: BasePharmacySupabaseClient) => ({
  async getAllCustomersByTenantId(tenantId: string): Promise<Customer[]> {
    const { data, error } = await client
      .from('customers')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    return data as Customer[]
  },
  async createCustomer(params: CustomerInsert): Promise<Customer> {
    const { data, error } = await client
      .from('customers')
      .insert({
        tenant_id: params.tenant_id,
        name: params.name,
        phone: params.phone ?? null,
        address: params.address ?? null,
        description: params.description ?? null,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Customer
  },
  async updateCustomer(customerId: string, params: CustomerUpdate): Promise<Customer> {
    const { data, error } = await client
      .from('customers')
      .update({
        name: params.name,
        phone: params.phone,
        address: params.address,
        description: params.description,
      })
      .eq('id', customerId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Customer
  },
  async deleteCustomer(customerId: string): Promise<void> {
    const { error } = await client.from('customers').delete().eq('id', customerId)

    if (error) {
      throw error
    }
  },
})
