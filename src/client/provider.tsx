import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { isNetworkError } from '@/services/offline/mutation-queue'
import { clearAllOfflineData } from '@/services/offline/persister'
import { supabaseAuth } from '@/services/supabase'
import { getProfilesQueryOptions } from './queries'
import type {
  ProfileWithRelations,
  Tenant,
  Location,
} from '@/services/supabase/database/model'

export type UserData = {
  // From Supabase Auth
  id: string
  email: string
  role: string | null
  // From Profile table
  profile: ProfileWithRelations | null
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
  const [authUser, setAuthUser] = useState<{
    id: string
    email: string
    role: string | null
  } | null>(null)
  const queryClient = useQueryClient()

  useEffect(() => {
    const subscription = supabaseAuth.onAuthStateChange((event, session) => {
      if (event === 'TOKEN_REFRESHED') return
      if (session?.user) {
        setAuthUser((prev) => {
          // Avoid unnecessary re-renders if user hasn't changed
          if (prev?.id === session.user.id) return prev
          return {
            id: session.user.id,
            email: session.user.email || '',
            role:
              (session.user.app_metadata?.role as string | undefined) ?? null,
          }
        })
      } else if (event === 'SIGNED_OUT') {
        // Only clear state on explicit sign-out, not on transient failures
        setAuthUser(null)
        queryClient.clear()
        clearAllOfflineData()
      }
    })

    // Fallback: ensure session is loaded if INITIAL_SESSION was missed
    supabaseAuth.getSession().then((session) => {
      if (session?.user) {
        setAuthUser((prev) => {
          if (prev) return prev
          return {
            id: session.user.id,
            email: session.user.email || '',
            role:
              (session.user.app_metadata?.role as string | undefined) ?? null,
          }
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [queryClient])

  const profileQuery = useQuery({
    ...getProfilesQueryOptions(authUser?.id ?? ''),
    enabled: !!authUser?.id,
  })

  const profile = profileQuery.data ?? null

  useEffect(() => {
    if (profileQuery.isError && !isNetworkError(profileQuery.error) && navigator.onLine) {
      window.location.href = '/500'
    }
  }, [profileQuery.isError, profileQuery.error])

  const isLoading = profileQuery.isLoading

  const user: UserData | null = authUser
    ? {
      id: authUser.id,
      email: authUser.email,
      role: authUser.role,
      profile,
      tenant: profile?.tenant ?? null,
      location: profile?.location ?? null,
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
