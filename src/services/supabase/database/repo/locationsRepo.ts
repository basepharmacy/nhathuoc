import { BasePharmacySupabaseClient } from '../../client'
import type { Tables, TablesInsert, TablesUpdate } from '../../database.types'

export type Location = Tables<'locations'>
export type LocationInsert = TablesInsert<'locations'>
export type LocationUpdate = TablesUpdate<'locations'>

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
      .order('created_at', { ascending: true })

    if (error) {
      throw error
    }

    return data as Location[]
  },
  async createLocation(params: LocationInsert): Promise<Location> {
    const { data, error } = await client
      .from('locations')
      .insert(params)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Location
  },
  async updateLocation(locationId: string, params: LocationUpdate): Promise<Location> {
    const { data, error } = await client
      .from('locations')
      .update(params)
      .eq('id', locationId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data as Location
  },
  async deleteLocation(locationId: string): Promise<void> {
    const { error } = await client
      .from('locations')
      .delete()
      .eq('id', locationId)

    if (error) {
      throw error
    }
  },
})
