import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type StaffUser } from '../data/staff-schema'

type StaffDialogType = 'add' | 'edit' | 'delete'

type StaffContextType = {
  open: StaffDialogType | null
  setOpen: (str: StaffDialogType | null) => void
  currentRow: StaffUser | null
  setCurrentRow: React.Dispatch<React.SetStateAction<StaffUser | null>>
}

const StaffContext = React.createContext<StaffContextType | null>(null)

export function StaffProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<StaffDialogType>(null)
  const [currentRow, setCurrentRow] = useState<StaffUser | null>(null)

  return (
    <StaffContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </StaffContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useStaff = () => {
  const staffContext = React.useContext(StaffContext)

  if (!staffContext) {
    throw new Error('useStaff has to be used within <StaffContext>')
  }

  return staffContext
}
