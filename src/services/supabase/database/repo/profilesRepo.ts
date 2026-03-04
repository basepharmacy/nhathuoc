import { BasePharmacySupabaseClient } from '../../client'
import type { ProfileWithRelations } from '../model'

export const createProfileRepository = (client: BasePharmacySupabaseClient) => ({
  async getProfileByUserId(userId: string): Promise<ProfileWithRelations | null> {
    const { data, error } = await client
      .from('profiles')
      .select('*, tenant:tenants(*), location:locations(*)')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      throw error
    }

    return data as ProfileWithRelations
  },
  async getProfilesByTenantId(tenantId: string): Promise<ProfileWithRelations[]> {
    const { data, error } = await client
      .from('profiles')
      .select('*, tenant:tenants(*), location:locations(*)')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return (data ?? []) as ProfileWithRelations[]
  },
  async updateProfile(
    profileId: string,
    payload: {
      name: string
      phone?: string | null
      address?: string | null
      description?: string | null
      location_id?: string | null
    }
  ): Promise<ProfileWithRelations> {
    const { data, error } = await client
      .from('profiles')
      .update({
        name: payload.name,
        phone: payload.phone ?? null,
        address: payload.address ?? null,
        description: payload.description ?? null,
        location_id: payload.location_id ?? null,
      })
      .eq('id', profileId)
      .select('*, tenant:tenants(*), location:locations(*)')
      .single()

    if (error) {
      throw error
    }

    return data as ProfileWithRelations
  },
})
