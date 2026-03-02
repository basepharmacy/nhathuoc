import React, { useState } from 'react'
import useDialogState from '@/hooks/use-dialog-state'
import { type BankAccount } from '../data/schema'

type BankAccountsDialogType = 'add' | 'edit' | 'delete'

type BankAccountsContextType = {
  open: BankAccountsDialogType | null
  setOpen: (str: BankAccountsDialogType | null) => void
  currentRow: BankAccount | null
  setCurrentRow: React.Dispatch<React.SetStateAction<BankAccount | null>>
}

const BankAccountsContext = React.createContext<BankAccountsContextType | null>(null)

export function BankAccountsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<BankAccountsDialogType>(null)
  const [currentRow, setCurrentRow] = useState<BankAccount | null>(null)

  return (
    <BankAccountsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </BankAccountsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useBankAccounts = () => {
  const ctx = React.useContext(BankAccountsContext)

  if (!ctx) {
    throw new Error('useBankAccounts has to be used within <BankAccountsProvider>')
  }

  return ctx
}
