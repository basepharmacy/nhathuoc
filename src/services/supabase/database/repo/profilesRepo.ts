import { BasePharmacySupabaseClient } from '../../client'
import type { Profile } from '../model'

export const createProfileRepository = (client: BasePharmacySupabaseClient) => ({
  async getProfileByUserId(userId: string): Promise<Profile | null> {
    console.log("Fetching profile for userId:", userId)
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      throw error
    }

    return data as Profile
  },
})
