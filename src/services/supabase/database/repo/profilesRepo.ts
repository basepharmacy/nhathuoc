import { BasePharmacySupabaseClient } from '../../client'
import type { ProfileWithRelations } from '../model'

export const createProfileRepository = (client: BasePharmacySupabaseClient) => ({
  async getProfileByUserId(userId: string): Promise<ProfileWithRelations | null> {
    console.log("Fetching profile for userId:", userId)
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
})
