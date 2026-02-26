import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { supabaseAuth, supabaseClient } from '@/services/supabase'
import {
  createProfileRepository,
  createTenantRepository,
  createLocationRepository,
} from '@/services/supabase'
import type { Profile, Tenant, Location } from '@/services/supabase/database/model'

export type UserData = {
  // From Supabase Auth
  id: string
  email: string
  // From Profile table
  profile: Profile | null
  // From Tenant table
  tenant: Tenant | null
  // From Location table
  location: Location | null
}

type UserContextType = {
  user: UserData | null
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

type AuthUserProviderProps = {
  children: ReactNode
}

export function AuthUserProvider({ children }: AuthUserProviderProps) {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Initialize auth on mount
  useEffect(() => {
    let isMounted = true

    const initializeAuth = async () => {
      try {
        const session = await supabaseAuth.getSession()
        if (isMounted && session?.user?.id) {
          setIsLoading(true)
          const profileRepo = createProfileRepository(supabaseClient)
          const tenantRepo = createTenantRepository(supabaseClient)
          const locationRepo = createLocationRepository(supabaseClient)

          try {
            const profile = await profileRepo.getProfileByUserId(session.user.id)
            let tenant = null
            if (profile?.tenant_id) {
              tenant = await tenantRepo.getTenantById(profile.tenant_id)
            }
            let location = null
            if (profile?.location_id) {
              location = await locationRepo.getLocationById(profile.location_id)
            }

            if (isMounted) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                profile,
                tenant,
                location,
              })
            }
          } catch (error) {
            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.error('Failed to load user data:', error)
            }
          } finally {
            if (isMounted) {
              setIsLoading(false)
            }
          }
        }
      } catch (error) {
        if (isMounted && import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error('Auth session error:', error)
        }
      }
    }

    initializeAuth()

    const subscription = supabaseAuth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user?.id) {
          setIsLoading(true)
          const profileRepo = createProfileRepository(supabaseClient)
          const tenantRepo = createTenantRepository(supabaseClient)
          const locationRepo = createLocationRepository(supabaseClient)

          try {
            const profile = await profileRepo.getProfileByUserId(session.user.id)
            let tenant = null
            if (profile?.tenant_id) {
              tenant = await tenantRepo.getTenantById(profile.tenant_id)
            }
            let location = null
            if (profile?.location_id) {
              location = await locationRepo.getLocationById(profile.location_id)
            }

            if (isMounted) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                profile,
                tenant,
                location,
              })
            }
          } catch (error) {
            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.error('Failed to load user data on auth change:', error)
            }
          } finally {
            if (isMounted) {
              setIsLoading(false)
            }
          }
        } else {
          if (isMounted) {
            setUser(null)
          }
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within AuthUserProvider')
  }
  return context
}
