import { BasePharmacySupabaseClient } from '../../client'
import type { Tables } from '../../database.types'

export type Tenant = Tables<'tenants'>

export const createTenantRepository = (client: BasePharmacySupabaseClient) => ({
  async getTenantById(tenantId: string): Promise<Tenant | null> {
    const { data, error } = await client
      .from('tenants')
      .select('*')
      .eq('id', tenantId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return data as Tenant
  },
})
