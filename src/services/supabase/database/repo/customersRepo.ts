import { BasePharmacySupabaseClient } from '../../client'
import { Customer, CustomerInsert, CustomerUpdate } from '../model'


export const createCustomerRepository = (client: BasePharmacySupabaseClient) => ({
  async getCustomerById(params: {
    tenantId: string
    customerId: string
  }): Promise<Customer | null> {
    const { data, error } = await client
      .from('customers')
      .select('*')
      .eq('tenant_id', params.tenantId)
      .eq('id', params.customerId)
      .maybeSingle()

    if (error) {
      throw error
    }

    return (data ?? null) as Customer | null
  },
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
