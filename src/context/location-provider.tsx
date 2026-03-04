import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useUser } from '@/client/provider'
import type { Location } from '@/services/supabase/database/model'

type LocationContextType = {
  selectedLocationId: string | null
  setSelectedLocationId: (id: string | null) => void
  selectedLocation: Location | null
  setLocations: (locations: Location[]) => void
  locations: Location[]
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

type LocationProviderProps = {
  children: ReactNode
}

export function LocationProvider({ children }: LocationProviderProps) {
  const { user } = useUser()
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [locations, setLocationsState] = useState<Location[]>([])
  const [hasUserSelected, setHasUserSelected] = useState(false)

  const selectedLocation = locations.find((l) => l.id === selectedLocationId) ?? null

  const setLocations = useCallback((locs: Location[]) => {
    setLocationsState(locs)
  }, [])

  const handleSetSelectedLocationId = useCallback((id: string | null) => {
    setHasUserSelected(true)
    setSelectedLocationId(id)
  }, [])

  // Auto-select location based on role when locations are loaded and nothing is selected
  useEffect(() => {
    if (locations.length === 0 || selectedLocationId || hasUserSelected) {
      return
    }

    const role = user?.role?.toUpperCase() ?? null

    if (role === 'OWNER') {
      setHasUserSelected(true)
      setSelectedLocationId(null)
      return
    }

    if (role === 'STAFF') {
      const staffLocationId = user?.profile?.location_id ?? null
      if (staffLocationId) {
        setSelectedLocationId(staffLocationId)
        return
      }
    }

    setSelectedLocationId(locations[0].id)
  }, [
    locations,
    selectedLocationId,
    hasUserSelected,
    user?.role,
    user?.profile?.location_id,
  ])

  return (
    <LocationContext.Provider
      value={{
        selectedLocationId,
        setSelectedLocationId: handleSetSelectedLocationId,
        selectedLocation,
        setLocations,
        locations,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export function useLocationContext() {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocationContext must be used within LocationProvider')
  }
  return context
}
