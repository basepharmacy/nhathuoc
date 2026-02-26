import {
  AuthChangeEvent,
  Session,
  Subscription,
  User,
} from "@supabase/supabase-js"
import { BasePharmacySupabaseClient } from "../client"

type AuthStateChangeCallback = (
  event: AuthChangeEvent,
  session: Session | null
) => void | Promise<void>

const createAuthClient = (client: BasePharmacySupabaseClient) => ({
  async getUser(): Promise<User | null> {
    const result = await client.auth.getUser()
    if (result.error) throw result.error
    return result.data.user
  },

  async getSession(): Promise<Session | null> {
    const result = await client.auth.getSession()
    if (result.error) throw result.error
    return result.data.session
  },

  onAuthStateChange(callback: AuthStateChangeCallback): Subscription {
    const { data } = client.auth.onAuthStateChange(callback)
    return data.subscription
  },

  async signInAnonymously(): Promise<void> {
    const { error } = await client.auth.signInAnonymously()
    if (error) throw error
  },
  async signOut(): Promise<void> {
    const { error } = await client.auth.signOut()
    if (error) throw error
  },
})

export { createAuthClient }
export type { AuthStateChangeCallback }
