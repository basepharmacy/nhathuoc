import {
  createClient,
  SupabaseClient,
  SupabaseClientOptions,
  SupportedStorage,
} from '@supabase/supabase-js'
import { Database } from './database.types'

export type BasePharmacySupabaseClient = SupabaseClient<Database>

// In-memory sequential lock with acquisition timeout.
// Prevents indefinite blocking when a background token refresh
// (triggered by visibilitychange) gets throttled by the browser.
let _lockQueue = Promise.resolve()
const timedLock = <R>(
  _name: string,
  _acquireTimeout: number,
  fn: () => Promise<R>
): Promise<R> => {
  const prev = _lockQueue
  let release!: () => void
  _lockQueue = new Promise<void>((r) => { release = r })

  const wait = Promise.race([
    prev,
    new Promise<void>((resolve) => setTimeout(resolve, 10_000)),
  ])

  return wait.then(() => fn()).finally(() => release()) as Promise<R>
}

function createBasePharmacyClient(
  baseUrl: string,
  anonKey: string,
  storage: SupportedStorage
): BasePharmacySupabaseClient {
  const options: SupabaseClientOptions<'public'> = {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: timedLock,
    },
  }

  return createClient(baseUrl, anonKey, options)
}

export { createBasePharmacyClient }
