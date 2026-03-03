import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
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
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null)
  const [locations, setLocationsState] = useState<Location[]>([])

  const selectedLocation = locations.find((l) => l.id === selectedLocationId) ?? null

  const setLocations = useCallback((locs: Location[]) => {
    setLocationsState(locs)
  }, [])

  // Auto-select first location when locations are loaded and nothing is selected
  useEffect(() => {
    if (locations.length > 0 && !selectedLocationId) {
      setSelectedLocationId(locations[0].id)
    }
  }, [locations, selectedLocationId])

  return (
    <LocationContext.Provider
      value={{
        selectedLocationId,
        setSelectedLocationId,
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
