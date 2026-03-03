import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type Location } from '@/services/supabase'

type LocationsDialogType = 'add' | 'edit' | 'delete'

type LocationsContextType = {
  open: LocationsDialogType | null
  setOpen: (str: LocationsDialogType | null) => void
  currentRow: Location | null
  setCurrentRow: React.Dispatch<React.SetStateAction<Location | null>>
}

const LocationsContext = React.createContext<LocationsContextType | null>(null)

export function LocationsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<LocationsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<Location | null>(null)

  return (
    <LocationsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </LocationsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLocations = () => {
  const ctx = React.useContext(LocationsContext)

  if (!ctx) {
    throw new Error('useLocations has to be used within <LocationsContext>')
  }

  return ctx
}
