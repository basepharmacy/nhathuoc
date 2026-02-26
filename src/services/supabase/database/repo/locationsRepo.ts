import { BasePharmacySupabaseClient } from '../../client'
import type { Tables } from '../../database.types'

export type Location = Tables<'locations'>

export const createLocationRepository = (client: BasePharmacySupabaseClient) => ({
  async getLocationById(locationId: string): Promise<Location | null> {
    const { data, error } = await client
      .from('locations')
      .select('*')
      .eq('id', locationId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw error
    }

    return data as Location
  },
  async getLocationsByTenantId(tenantId: string): Promise<Location[]> {
    const { data, error } = await client
      .from('locations')
      .select('*')
      .eq('tenant_id', tenantId)

    if (error) {
      throw error
    }

    return data as Location[]
  }
})
