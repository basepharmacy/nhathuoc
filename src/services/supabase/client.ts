import {
  createClient,
  processLock,
  SupabaseClient,
  SupabaseClientOptions,
  SupportedStorage,
} from '@supabase/supabase-js'
import { Database } from './database.types'

export type FamilyTaskSupabaseClient = SupabaseClient<Database>

function createFamilyTaskClient(
  baseUrl: string,
  anonKey: string,
  storage: SupportedStorage
): FamilyTaskSupabaseClient {
  const options: SupabaseClientOptions<'public'> = {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  }

  return createClient(baseUrl, anonKey, options)
}

export { createFamilyTaskClient }
