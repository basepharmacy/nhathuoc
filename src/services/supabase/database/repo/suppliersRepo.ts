import { BasePharmacySupabaseClient } from '../../client'
import type { Tables, TablesInsert, TablesUpdate } from '../../database.types'

export type Supplier = Tables<'suppliers'>
export type SupplierInsert = TablesInsert<'suppliers'>
export type SupplierUpdate = TablesUpdate<'suppliers'>

export const createSupplierRepository = (client: BasePharmacySupabaseClient) => ({
  async getAllSuppliersByTenantId(tenantId: string): Promise<Supplier[]> {
    const { data, error } = await client
      .from('suppliers')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    return data as Supplier[]
  },
  async createSupplier(params: SupplierInsert): Promise<Supplier> {
    const { data, error } = await client
      .from('suppliers')
      .insert({
        tenant_id: params.tenant_id,
        name: params.name,
        phone: params.phone ?? null,
        address: params.address ?? null,
        representative: params.representative ?? null,
        description: params.description ?? null,
        is_active: params.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Supplier
  },
  async updateSupplier(supplierId: string, params: SupplierUpdate): Promise<Supplier> {
    const { data, error } = await client
      .from('suppliers')
      .update({
        name: params.name,
        phone: params.phone,
        address: params.address,
        representative: params.representative,
        description: params.description,
        is_active: params.is_active,
      })
      .eq('id', supplierId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Supplier
  },
  async deleteSupplier(supplierId: string): Promise<void> {
    const { error } = await client.from('suppliers').delete().eq('id', supplierId)

    if (error) {
      throw error
    }
  },
})
