import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { supabaseAuth } from '@/services/supabase'
import {
  getProfilesQueryOptions,
  getTenantQueryOptions,
  getLocationQueryOptions,
} from './queries'
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
  const [authUser, setAuthUser] = useState<{ id: string; email: string } | null>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    supabaseAuth.getSession().then((session) => {
      if (session?.user) {
        setAuthUser({ id: session.user.id, email: session.user.email || '' })
      }
    })

    const subscription = supabaseAuth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') return
      if (session?.user) {
        setAuthUser({ id: session.user.id, email: session.user.email || '' })
      } else {
        setAuthUser(null)
        queryClient.clear()
      }
    })

    return () => subscription.unsubscribe()
  }, [queryClient])

  const profileQuery = useQuery({
    ...getProfilesQueryOptions(authUser?.id ?? ''),
    enabled: !!authUser?.id,
  })

  const profile = profileQuery.data ?? null

  const tenantQuery = useQuery({
    ...getTenantQueryOptions(profile?.tenant_id ?? ''),
    enabled: !!profile?.tenant_id,
  })

  const locationQuery = useQuery({
    ...getLocationQueryOptions(profile?.location_id ?? ''),
    enabled: !!profile?.location_id,
  })

  const navigate = useNavigate()

  useEffect(() => {
    if (profileQuery.isError || tenantQuery.isError || locationQuery.isError) {
      navigate({ to: '/500' })
    }
  }, [profileQuery.isError, tenantQuery.isError, locationQuery.isError, navigate])

  const isLoading =
    profileQuery.isLoading || tenantQuery.isLoading || locationQuery.isLoading

  const user: UserData | null = authUser
    ? {
        id: authUser.id,
        email: authUser.email,
        profile,
        tenant: tenantQuery.data ?? null,
        location: locationQuery.data ?? null,
      }
    : null

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
