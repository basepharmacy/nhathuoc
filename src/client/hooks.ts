import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useUser } from './provider'
import { getLocationsQueryOptions } from './queries'

export function useLocations() {
  const { user } = useUser()
  const tenantId = user?.profile?.tenant_id ?? ''
  const isStaff = user?.role === 'STAFF'

  const { data: fetchedLocations = [], isError, isLoading } = useQuery({
    ...getLocationsQueryOptions(tenantId),
    enabled: !!tenantId && !isStaff,
  })

  const locations = useMemo(
    () => isStaff && user?.location ? [user.location] : fetchedLocations,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isStaff, user?.location?.id, fetchedLocations]
  )

  return { locations, isError, isLoading: isStaff ? false : isLoading }
}
